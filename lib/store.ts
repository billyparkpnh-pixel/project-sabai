import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";
import { seed, type Content } from "./content";
let local: DatabaseSync | undefined;
const remote = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, { max: 5, ssl: "require" })
  : null;
function sqlite() {
  if (!local) {
    const path = resolve(process.env.DATA_PATH || ".data/sabai.sqlite");
    mkdirSync(dirname(path), { recursive: true });
    local = new DatabaseSync(path);
    local.exec(
      "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(kind,id));",
    );
  }
  return local;
}
export async function getRecord<T>(
  kind: string,
  id: string,
): Promise<T | null> {
  if (remote) {
    const rows =
      await remote`SELECT data FROM records WHERE kind=${kind} AND id=${id}`;
    return (rows[0]?.data as T) || null;
  }
  const r = sqlite()
    .prepare("SELECT data FROM records WHERE kind=? AND id=?")
    .get(kind, id);
  return r ? JSON.parse(r.data as string) : null;
}
export async function putRecord(kind: string, id: string, data: unknown) {
  if (remote)
    await remote`INSERT INTO records(kind,id,data) VALUES(${kind},${id},${remote.json(data as never)}) ON CONFLICT(kind,id) DO UPDATE SET data=EXCLUDED.data`;
  else
    sqlite()
      .prepare(
        "INSERT INTO records(kind,id,data) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",
      )
      .run(kind, id, JSON.stringify(data));
}
export async function insertRecord(kind: string, id: string, data: unknown) {
  if (remote) {
    await remote`INSERT INTO records(kind,id,data) VALUES(${kind},${id},${remote.json(data as never)}) ON CONFLICT(kind,id) DO NOTHING`;
  } else
    sqlite()
      .prepare("INSERT OR IGNORE INTO records(kind,id,data) VALUES(?,?,?)")
      .run(kind, id, JSON.stringify(data));
  return (await getRecord(kind, id))!;
}
export async function listRecords<T = Record<string, unknown>>(
  kind: string,
): Promise<T[]> {
  if (remote) {
    const rows =
      await remote`SELECT data FROM records WHERE kind=${kind} ORDER BY created_at DESC`;
    return rows.map((r) => r.data as T);
  }
  return sqlite()
    .prepare("SELECT data FROM records WHERE kind=? ORDER BY created_at DESC")
    .all(kind)
    .map((r) => JSON.parse(r.data as string));
}
export async function content(): Promise<Content> {
  return (await getRecord<Content>("content", "site")) || structuredClone(seed);
}
export async function audit(action: string, detail: unknown) {
  await putRecord("audit", crypto.randomUUID(), {
    action,
    detail,
    at: new Date().toISOString(),
  });
}
