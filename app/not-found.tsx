import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container section">
      <p className="eyebrow">A little detour</p>
      <h1>This page isn’t in our scrapbook.</h1>
      <Link className="button" href="/">
        Back home →
      </Link>
    </main>
  );
}
