"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Sun,
  MapPin,
  Mail,
  Plus,
  Minus,
  Trash2,
  Check,
  ShieldCheck,
  Lock,
  BookOpen,
  Users,
  Stethoscope,
  Leaf,
} from "lucide-react";
import type { Content, Product, Project } from "@/lib/content";
type CartItem = { id: string; size: string; quantity: number };
type Receipt = { id: string; token: string; kind: string };
async function api(path: string, data?: unknown, key?: string) {
  const r = await fetch("/api/" + path, {
    method: data === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const b = await r.json();
  if (!r.ok) throw Error(b.error || "Request failed");
  return b;
}
const money = (n: number | null) =>
  n === null
    ? "Not configured"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n);
export default function Site({
  initial,
  preview,
  mediaApproved,
}: {
  initial: Content;
  preview: boolean;
  mediaApproved: boolean;
}) {
  const [c, setC] = useState(initial),
    [cart, setCart] = useState<CartItem[]>([]),
    [ready, setReady] = useState(false),
    [lang, setLang] = useState("en"),
    [menu, setMenu] = useState(false),
    [notice, setNotice] = useState("");
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("sabai-cart") || "[]");
        if (Array.isArray(stored))
          setCart(
            stored.filter(
              (i) =>
                typeof i.id === "string" &&
                typeof i.size === "string" &&
                Number.isInteger(i.quantity) &&
                i.quantity > 0 &&
                i.quantity <= 10,
            ),
          );
        setLang(localStorage.getItem("sabai-lang") || "en");
      } catch {}
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("sabai-cart", JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    document.documentElement.lang = lang === "km" ? "km" : "en";
    if (ready) localStorage.setItem("sabai-lang", lang);
  }, [lang, ready]);
  const t = (key: string) =>
    c.translations[lang]?.[key] || c.translations.en?.[key] || key;
  const links = [
    ["home", "/"],
    ["about", "/about"],
    ["projects", "/projects"],
    ["shop", "/shop"],
    ["contact", "/contact"],
  ];
  function add(p: Product, size: string, quantity: number) {
    setCart((old) => {
      const exists = old.find((i) => i.id === p.id && i.size === size);
      return exists
        ? old.map((i) =>
            i === exists
              ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
              : i,
          )
        : [...old, { id: p.id, size, quantity }];
    });
    setNotice("Added to your test cart.");
  }
  const media = (name: string, alt: string, cls = "", priority = false) =>
    !name ? (
      <div className={"photo-placeholder missing-asset " + cls}>
        <ShoppingBag size={52} />
        <span>Design reference not supplied</span>
        <small>Placeholder · original artwork needed</small>
      </div>
    ) : preview || mediaApproved ? (
      <Image
        src={"/api/media/" + name}
        alt={alt}
        width={
          name === "takeo-field-visit.png"
            ? 606
            : name.startsWith("merch")
              ? 1080
              : 1304
        }
        height={
          name === "takeo-field-visit.png"
            ? 1058
            : name.startsWith("merch")
              ? 1440
              : name === "branding-teams.png"
                ? 1722
                : 1166
        }
        sizes="(max-width: 700px) 95vw, (max-width: 1100px) 45vw, 600px"
        className={cls}
        preload={priority}
        loading={priority ? undefined : path !== "/" ? "eager" : "lazy"}
        unoptimized={preview}
      />
    ) : (
      <div className={"photo-placeholder " + cls}>
        <Sun size={55} />
        <span>Community photograph</span>
        <small>Awaiting publication consent</small>
      </div>
    );
  const projectCards = (projects: Project[]) =>
    projects.map((p, i) => (
      <Link
        href={"/projects/" + p.id}
        className={"project-card project-tone-" + (i % 3)}
        key={p.id}
      >
        <div className="project-art">
          {p.image ? (
            media(p.image, "Internal reference: Takéo reconnaissance trip")
          ) : i % 2 ? (
            <BookOpen size={68} strokeWidth={1} />
          ) : (
            <Leaf size={68} strokeWidth={1} />
          )}
          <span className="tag">{p.type}</span>
        </div>
        <div className="card-body">
          <small>
            <MapPin size={13} />
            {p.location}
          </small>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <span className="text-link">
            Read the story <ArrowUpRight size={18} />
          </span>
        </div>
      </Link>
    ));
  const productCards = (products: Product[] = c.products) =>
    products.map((p) => (
      <Link key={p.id} href={"/shop/" + p.id} className="product-card">
        <div className="product-art">
          {media(p.image, p.title + " — supplied full front and back mockup")}
          <span className="tag">Pre-order · test catalog</span>
        </div>
        <div className="product-info">
          <div>
            <h3>{p.title}</h3>
            <p>
              {p.color} tee ·{" "}
              {p.rightsRequired ? "Rights approval required" : "Pre-order"}
            </p>
          </div>
          <ArrowUpRight />
        </div>
        <strong>
          {p.price === null ? "Price to be confirmed" : money(p.price)}
        </strong>
      </Link>
    ));

  let body;
  if (path === "/")
    body = (
      <>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="little-line" /> CAMBODIA · COMMUNITY · CARE
              </div>
              <h1>
                {lang === "km" ? (
                  t("headline")
                ) : (
                  <>
                    Together, we
                    <br />
                    make a <span className="highlight">difference.</span>
                  </>
                )}
              </h1>
              <p>
                Small acts of care. Lasting connections.
                <br />A shared heart for healthier communities in Cambodia.
              </p>
              <div className="button-row">
                <Link className="button" href="/projects">
                  {t("explore")} <ArrowUpRight size={18} />
                </Link>
                <Link className="button light" href="/donate">
                  {t("give")} <Heart size={17} />
                </Link>
              </div>
              <div className="hero-note">
                <span className="scribble-arrow">↳</span> A little heart goes a
                long way.
              </div>
            </div>
            <div className="scrapbook">
              <div className="gingham" />
              <div className="sun-doodle">
                <Sun size={100} strokeWidth={1.3} />
              </div>
              <div className="polaroid main-photo">
                <span className="tape" />
                {media(
                  c.pages.heroImage,
                  "Internal reference: original Project Sa’Bai introduction and Clinic Heads scrapbook",
                  "hero-photo",
                  true,
                )}
                <div className="photo-caption">
                  One goal. One heart. One Sa’Bai. ♡
                </div>
              </div>
              <span className="sticker">
                CARE
                <br />
                CONNECTS
                <br />
                US.
              </span>
              <span className="reference-label">
                Internal brand reference · proposed website
              </span>
            </div>
          </div>
        </section>
        <div className="slogan-strip">
          <span>✳</span> {t("slogan")} <span>✳</span> Care, beyond borders.{" "}
          <span>✳</span>
        </div>
        <section className="container section intro-grid">
          <div>
            <span className="eyebrow">HELLO, WE’RE PROJECT SA’BAI</span>
            <h2>
              Different backgrounds.
              <br />
              <em>One shared purpose.</em>
            </h2>
          </div>
          <div>
            <p className="lead">{c.pages.intro}</p>
            <p>
              From listening to local communities to sharing health knowledge,
              we believe meaningful change begins with people showing up for one
              another.
            </p>
            <Link className="text-link" href="/about">
              Get to know us <ArrowUpRight size={18} />
            </Link>
            <small className="verification">
              Organizational history and descriptions await official
              verification.
            </small>
          </div>
        </section>
        <section className="soft-section">
          <div className="container section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">OUR WORK, OUR HEART</span>
                <h2>Stories of connection.</h2>
              </div>
              <Link className="text-link" href="/projects">
                All projects & impact <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="grid three">
              {projectCards(c.projects.filter((p) => p.featured).slice(0, 3))}
            </div>
          </div>
        </section>
        <section className="container section">
          <div className="impact-band">
            <div>
              <span className="eyebrow">PEOPLE BEFORE NUMBERS</span>
              <h2>Every connection counts.</h2>
              <p>We’ll share verified outcomes as they become available.</p>
            </div>
            <div className="stats">
              {c.impact.map((m) => (
                <div key={m.id}>
                  <strong>{m.verified ? m.value : "—"}</strong>
                  <span>{m.label}</span>
                  <small>
                    {m.verified ? "Verified" : "Awaiting verified data"}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="container section shop-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WEAR A LITTLE GOOD</span>
              <h2>Good cause. Great tees.</h2>
            </div>
            <Link className="text-link" href="/shop">
              Explore the shop <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="grid two">{productCards(c.products.slice(0, 2))}</div>
        </section>
        <div className="container">
          <Campaigns campaigns={c.campaigns} media={media} />
        </div>
        <DonateCallout />
      </>
    );
  else if (path === "/about")
    body = (
      <>
        <div className="container">
          <Intro
            kicker="THE PEOPLE BEHIND THE PURPOSE"
            title="One heart. Many hands."
          >
            {c.pages.intro}
          </Intro>
          <div className="about-collage">
            <div className="polaroid">
              {media(
                "branding-teams.png",
                "Internal team scrapbook reference: Health Education, Public Relations and Pharm Logs",
              )}
              <p className="photo-caption">A shared heart for community.</p>
            </div>
            <div>
              <span className="eyebrow">WHY WE COME TOGETHER</span>
              <h2>Care is a collective effort.</h2>
              <p className="lead">{c.pages.mission}</p>
              <div className="values">
                {[
                  [
                    "Listen first",
                    "Community voices guide meaningful service.",
                  ],
                  ["Learn together", "Knowledge grows when we share it."],
                  [
                    "Care responsibly",
                    "Respect, consent and trust come before a story.",
                  ],
                ].map(([a, b], i) => (
                  <div key={a}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{a}</h3>
                      <p>{b}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <section className="section">
            <span className="eyebrow">OUR STORY</span>
            <h2>A journey built on connection.</h2>
            <div className="timeline">
              <strong>
                2006 <small>To verify</small>
              </strong>
              <p>{c.pages.history}</p>
              <strong>Today</strong>
              <p>
                This proposed website brings the project’s stories, community
                and future opportunities into one place. Official launch is
                subject to approval.
              </p>
            </div>
          </section>
          <section className="section">
            <span className="eyebrow">OUR TEAMS</span>
            <h2>Different strengths. Shared care.</h2>
            <div className="grid two">
              {c.teams.map((team, i) => (
                <article className="team-card" key={team.id}>
                  {team.image ? (
                    media(team.image, team.title)
                  ) : (
                    <span className="team-icon">
                      {i % 2 ? <Users /> : <Stethoscope />}
                    </span>
                  )}
                  <h3>{team.title}</h3>
                  <p>{team.description}</p>
                  <small>
                    {team.name || "Names and portraits awaiting consent"}
                  </small>
                </article>
              ))}
            </div>
            <h3 className="space-top">Our partners</h3>
            <p>{c.pages.partners}</p>
          </section>
        </div>
        <DonateCallout />
      </>
    );
  else if (path === "/projects")
    body = (
      <div className="container">
        <Intro
          kicker="OUR WORK, OUR HEART"
          title="Small steps. Shared progress."
        >
          Explore the preparation, learning and connections behind community
          care. Sample projects are clearly identified.
        </Intro>
        <ProjectFilter projects={c.projects} render={projectCards} />
        <Campaigns campaigns={c.campaigns} media={media} />
        <section className="section" id="impact">
          <span className="eyebrow">OUR IMPACT</span>
          <h2>Meaningful stories. Honest numbers.</h2>
          <div className="stats impact-box">
            {c.impact.map((m) => (
              <div key={m.id}>
                <strong>{m.verified ? m.value : "—"}</strong>
                <span>{m.label}</span>
                <small>
                  {m.verified
                    ? "Verified outcome"
                    : "Awaiting verification · no figure claimed"}
                </small>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  else if (path.startsWith("/projects/")) {
    const p = c.projects.find((p) => p.id === path.split("/")[2]);
    body = p ? (
      <div className="container">
        <Link href="/projects" className="back-link">
          ← All projects & impact
        </Link>
        <Intro kicker={p.type + " · " + p.status} title={p.title}>
          {p.location} · {p.year}
        </Intro>
        <div className="detail-grid">
          <div>
            {p.image && (
              <div className="polaroid">
                {media(p.image, "Internal reference: " + p.title)}
                <p className="photo-caption">
                  Field visit reference · not clinical outreach
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="lead">{p.description}</p>
            <p className="muted">{p.dates}</p>
            <h3>What we’re working towards</h3>
            <ul className="check-list">
              {p.goals.map((g) => (
                <li key={g}>
                  <Check size={18} />
                  {g}
                </li>
              ))}
            </ul>
            {!!p.activities?.length && (
              <>
                <h3>Activities</h3>
                <ul>
                  {p.activities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            )}
            {!!p.milestones?.length && (
              <>
                <h3>Milestones</h3>
                <ul>
                  {p.milestones.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </>
            )}
            <h3>Outcomes & documentation</h3>
            <p>{p.outcomes}</p>
            {p.metrics && <p>{p.metrics}</p>}
            {p.video && (
              <a
                href={p.video}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Approved video ↗
              </a>
            )}
            {p.fundraising && (
              <Link href="/donate" className="button">
                Explore test donations <Heart size={17} />
              </Link>
            )}
          </div>
        </div>
        {!!p.gallery?.length && (
          <section className="section">
            <h2>Project gallery</h2>
            <div className="grid three">
              {p.gallery.map((n) => (
                <div className="polaroid" key={n}>
                  {media(n, p.title + " approved gallery reference")}
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="section">
          <h2>More from our scrapbook</h2>
          <div className="grid two">
            {projectCards(
              c.projects.filter((other) => other.id !== p.id).slice(0, 2),
            )}
          </div>
        </section>
      </div>
    ) : null;
  } else if (path === "/shop")
    body = (
      <div className="container">
        <Intro kicker="WEAR YOUR HEART" title="Shop for a cause.">
          A little personality. A shared purpose. Explore the original Project
          Sa’Bai T-shirt design references.
        </Intro>
        <div className="info-banner">
          <ShoppingBag size={22} />
          <div>
            <strong>Design preview · test shopping only</strong>
            <p>
              All ten designs are $10 USD pre-orders in this test catalog.
              Sizes, preorder limits, delivery fees and fulfillment terms await
              approval. Eight original mockups are missing. No real purchases or
              payments are accepted.
            </p>
          </div>
        </div>
        <ShopCatalog products={c.products} render={productCards} />
        <section className="section">
          <div className="grid three">
            <Feature
              icon={<Heart />}
              title="Made with purpose"
              text="Designs supplied in the original project package."
            />
            <Feature
              icon={<ShoppingBag />}
              title="Your choice of fit"
              text="Preview size selection. Official sizing and stock await confirmation."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Clear from the start"
              text="Test checkout only. No money collected and no stock reserved."
            />
          </div>
        </section>
      </div>
    );
  else if (path.startsWith("/shop/")) {
    const p = c.products.find((p) => p.id === path.split("/")[2]);
    body = p ? (
      <div className="container">
        <Link className="back-link" href="/shop">
          ← Back to the shop
        </Link>
        <ProductDetail p={p} add={add} media={media} />
      </div>
    ) : null;
  } else if (path === "/cart")
    body = (
      <div className="container narrow">
        <Intro kicker="A LITTLE GOOD, IN YOUR BAG" title="Your cart.">
          Pre-order test cart · $10 USD per shirt · no real purchases.
        </Intro>
        {!ready ? (
          <p>Loading your cart…</p>
        ) : !cart.length ? (
          <div className="empty-state">
            <ShoppingBag size={50} />
            <h2>A little room for good.</h2>
            <p>Your bag is waiting for a design you love.</p>
            <Link href="/shop" className="button">
              Explore the shop <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item, i) => {
                const p = c.products.find((p) => p.id === item.id);
                return (
                  <article className="cart-row" key={item.id + item.size}>
                    <div className="cart-thumb">
                      {p && media(p.image, p.title)}
                    </div>
                    <div>
                      <h3>{p?.title || "Unavailable product"}</h3>
                      <p>
                        {p?.color} · Size {item.size}
                      </p>
                      <small>
                        {p?.price == null
                          ? "Price pending confirmation"
                          : money(p.price)}
                      </small>
                      <div className="quantity">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setCart(
                              cart.map((v, j) =>
                                j === i
                                  ? {
                                      ...v,
                                      quantity: Math.max(1, v.quantity - 1),
                                    }
                                  : v,
                              ),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            setCart(
                              cart.map((v, j) =>
                                j === i
                                  ? {
                                      ...v,
                                      quantity: Math.min(10, v.quantity + 1),
                                    }
                                  : v,
                              ),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="icon-button"
                      aria-label={"Remove " + p?.title}
                      onClick={() => setCart(cart.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={19} />
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="summary">
              <span>Subtotal</span>
              <strong>
                {cart.some(
                  (i) => c.products.find((p) => p.id === i.id)?.price == null,
                )
                  ? "To be confirmed"
                  : money(
                      cart.reduce(
                        (n, i) =>
                          n +
                          (c.products.find((p) => p.id === i.id)?.price || 0) *
                            i.quantity,
                        0,
                      ),
                    )}
              </strong>
              <p>Shipping and optional donation are chosen at test checkout.</p>
              <Link className="button" href="/checkout">
                Continue to test checkout <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    );
  else if (path === "/checkout")
    body = (
      <div className="container">
        <Intro
          kicker="TEST MODE · NO MONEY COLLECTED"
          title="A thoughtful final step."
        >
          Try the checkout experience. This creates a demo record, not a
          purchase.
        </Intro>
        <Checkout
          cart={cart}
          c={c}
          onComplete={(r) => {
            sessionStorage.setItem("sabai-receipt", JSON.stringify(r));
            setCart([]);
            router.push("/receipt");
          }}
        />
      </div>
    );
  else if (path === "/donate")
    body = (
      <div className="container">
        <Intro
          kicker="A LITTLE HEART GOES A LONG WAY"
          title="Be part of the good."
        >
          Your willingness to support community healthcare matters. Explore how
          donations will work when an authorized payment provider is connected.
        </Intro>
        <div className="detail-grid donation-layout">
          <div className="donation-story">
            <Sun size={86} strokeWidth={1.2} />
            <h2>
              Care grows when
              <br />
              we come together.
            </h2>
            <p>
              Future donations can support the project’s approved community
              work. Specific uses and fund allocation will be published once
              verified.
            </p>
            <div className="handwritten">One goal. One heart. ♡</div>
            <div className="info-banner">
              <ShieldCheck />
              <p>
                No real merchant account or payable KHQR is connected. This page
                cannot collect money.
              </p>
            </div>
          </div>
          <Donation
            onComplete={(r) => {
              sessionStorage.setItem("sabai-receipt", JSON.stringify(r));
              router.push("/receipt");
            }}
          />
        </div>
      </div>
    );
  else if (path === "/contact")
    body = (
      <div className="container">
        <Intro kicker="GOOD THINGS START WITH HELLO" title="Let’s connect.">
          {c.pages.contact}
        </Intro>
        <div className="detail-grid">
          <div className="contact-card">
            <Mail size={38} />
            <h2>
              A question?
              <br />
              An idea? A little hello?
            </h2>
            <p>We’re making space for meaningful conversations.</p>
            <a
              className="text-link"
              href="https://www.tiktok.com/@projectsabai_cambodia"
              target="_blank"
              rel="noreferrer"
            >
              TikTok · @projectsabai_cambodia <ArrowUpRight size={18} />
            </a>
            <p className="muted">
              Handle supplied in the brief; ownership awaits verification.
              Official email, address and phone will be added after
              confirmation.
            </p>
            <div className="gingham contact-pattern" />
          </div>
          <ContactForm />
        </div>
      </div>
    );
  else if (path === "/receipt")
    body = (
      <div className="container narrow">
        <ReceiptView />
      </div>
    );
  else if (["/privacy", "/shipping", "/returns"].includes(path))
    body = (
      <div className="container narrow section">
        <PolicyPage path={path} settings={c.settings} />
      </div>
    );
  else if (path === "/admin/reset")
    body = (
      <div className="container narrow">
        <PasswordReset />
      </div>
    );
  else if (path === "/admin")
    body = (
      <div className="container">
        <Admin onContent={setC} />
      </div>
    );
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="prototype-bar">
        PROPOSED WEBSITE <span>·</span>{" "}
        {preview ? "Internal reference preview" : "Awaiting official approval"}{" "}
        <span>·</span> Payments in test mode
      </div>
      <header>
        <div className="container header-inner">
          <Link href="/" className="wordmark" aria-label="Project Sa’Bai home">
            <Sun size={32} />
            <span>
              PROJECT<strong>SA’BAI</strong>
            </span>
          </Link>
          <nav aria-label="Main navigation" className={menu ? "open" : ""}>
            {links.map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className={path === href ? "active" : ""}
                onClick={() => setMenu(false)}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="language"
              onClick={() => setLang(lang === "en" ? "km" : "en")}
              aria-label="Switch language"
            >
              {lang === "en" ? "EN / ខ្មែរ" : "ខ្មែរ / EN"}
            </button>
            <Link
              className="cart-link"
              href="/cart"
              aria-label={
                "Cart, " + cart.reduce((n, i) => n + i.quantity, 0) + " items"
              }
            >
              <ShoppingBag size={21} />
              <span>{cart.reduce((n, i) => n + i.quantity, 0)}</span>
            </Link>
            <Link className="button donate-button" href="/donate">
              {t("donate")} <Heart size={15} />
            </Link>
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle menu"
              aria-expanded={menu}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        {lang === "km" && (
          <div className="container translation-note">
            ការបកប្រែពេញលេញកំពុងរៀបចំ · English content is shown where Khmer
            translation is pending.
          </div>
        )}
        {body}
      </main>
      <footer>
        <div className="container footer-top">
          <div>
            <Link className="wordmark" href="/">
              <Sun size={36} />
              <span>
                PROJECT<strong>SA’BAI</strong>
              </span>
            </Link>
            <p>
              One Goal, One Heart, One SA’BAI!
              <br />
              Care, beyond borders.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link href="/about">About us</Link>
            <Link href="/projects">Projects & impact</Link>
            <Link href="/shop">Shop for a cause</Link>
          </div>
          <div>
            <h4>Get involved</h4>
            <Link href="/donate">Donate · test mode</Link>
            <Link href="/contact">Volunteer & partner</Link>
            <a
              href="https://www.tiktok.com/@projectsabai_cambodia"
              target="_blank"
              rel="noreferrer"
            >
              TikTok ↗
            </a>
          </div>
          <div className="footer-note">
            <Heart />
            <p>
              A community-minded prototype.
              <br />
              Official details and image permissions await approval.
            </p>
            <Link href="/privacy">Privacy</Link>
            <Link href="/shipping">Shipping & preorders</Link>
            <Link href="/returns">Returns & refunds</Link>
            <Link href="/admin">
              Team admin <Lock size={12} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Project Sa’Bai website prototype
          </span>
          <span>
            No patient information is collected. Please don’t submit medical
            details.
          </span>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
          <Link href="/cart" onClick={() => setNotice("")}>
            View cart
          </Link>
          <button
            className="icon-button"
            aria-label="Dismiss"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
function Intro({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature">
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function DonateCallout() {
  return (
    <section className="donate-callout">
      <div className="container">
        <Sun size={80} strokeWidth={1.1} />
        <span className="eyebrow">THERE’S A PLACE FOR YOUR HEART HERE</span>
        <h2>
          Let’s make good
          <br />
          things happen. <span>♡</span>
        </h2>
        <p>Give your time. Share a story. Be part of our community.</p>
        <div className="button-row">
          <Link href="/donate" className="button">
            Explore giving <ArrowUpRight size={18} />
          </Link>
          <Link href="/contact" className="text-link">
            Get involved <ArrowRight size={18} />
          </Link>
        </div>
        <small>
          Donation experience in test mode. No real money collected.
        </small>
      </div>
    </section>
  );
}
function ProjectFilter({
  projects,
  render,
}: {
  projects: Project[];
  render: (p: Project[]) => React.ReactNode;
}) {
  const [status, setStatus] = useState("All"),
    [location, setLocation] = useState("All"),
    [topic, setTopic] = useState("All"),
    [year, setYear] = useState("All"),
    [type, setType] = useState("All");
  const selected = projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      (location === "All" || p.location === location) &&
      (topic === "All" || p.topic === topic) &&
      (year === "All" || p.year === year) &&
      (type === "All" || p.type === type),
  );
  return (
    <>
      <div className="filter-row">
        <div className="tabs" aria-label="Project status">
          {["All", "Past", "Current", "Upcoming"].map((s) => (
            <button
              key={s}
              className={status === s ? "selected" : ""}
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="select-filters">
          {[
            [
              "Location",
              location,
              setLocation,
              projects.map((p) => p.location),
            ],
            ["Topic", topic, setTopic, projects.map((p) => p.topic)],
            ["Year", year, setYear, projects.map((p) => p.year)],
            ["Type", type, setType, projects.map((p) => p.type)],
          ].map(([label, value, set, options]) => (
            <label key={String(label)}>
              <span className="sr-only">{String(label)}</span>
              <select
                value={String(value)}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
              >
                <option value="All">All {String(label).toLowerCase()}s</option>
                {[...new Set(options as string[])].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      <div className="grid three">{render(selected)}</div>
      {!selected.length && (
        <div className="empty-state">No projects match these filters.</div>
      )}
    </>
  );
}
function ProductDetail({
  p,
  add,
  media,
}: {
  p: Product;
  add: (p: Product, s: string, q: number) => void;
  media: (n: string, a: string, c?: string) => React.ReactNode;
}) {
  const [size, setSize] = useState(p.sizes[0]),
    [quantity, setQuantity] = useState(1),
    [large, setLarge] = useState(false);
  return (
    <>
      <div className="detail-grid product-detail">
        <div>
          <button
            className="image-button"
            aria-label="Enlarge full mockup"
            onClick={() => setLarge(true)}
          >
            {media(p.image, p.title + " full original front and back mockup")}
          </button>
          <small>
            {p.image
              ? "Original combined front + back mockup · click to enlarge"
              : "Placeholder · original combined mockup not supplied"}
          </small>
          <div className="grid two">
            {[p.frontImage, p.backImage].filter(Boolean).map((n) => (
              <div key={n}>
                {media(n!, p.title + " additional approved view")}
              </div>
            ))}
          </div>
        </div>
        <div className="product-details-copy">
          <span className="eyebrow">PROJECT SA’BAI · DESIGN REFERENCE</span>
          <h1>{p.title}</h1>
          <div className="badge">Pre-order · $10 USD demo catalog</div>
          <p className="lead">{p.description}</p>
          <h3>{p.price === null ? "Price to be confirmed" : money(p.price)}</h3>
          <p className="muted">
            Official sizing, preorder caps and fulfillment terms await
            confirmation. Test selections do not reserve stock or confirm a
            preorder.
          </p>
          {p.rightsRequired && (
            <div className="form-alert">
              DRAFT ONLY · character/artwork licensing must be confirmed before
              public sale.
            </div>
          )}
          {!p.sizes.length && (
            <div className="form-alert">
              Sizes awaiting admin configuration. Add to cart is disabled until
              approved sizes are supplied.
            </div>
          )}
          <label>
            Size
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              {p.sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))
              }
            />
          </label>
          <button
            className="button full"
            onClick={() => add(p, size, quantity)}
            disabled={p.stock === 0 || !p.sizes.length}
          >
            Add to test cart <ShoppingBag size={18} />
          </button>
          <details>
            <summary>Design & care notes</summary>
            <p>
              {p.color} T-shirt reference. Fabric composition, fit measurements
              and wash instructions will be provided by the team before sales
              open.
            </p>
          </details>
          <details>
            <summary>Delivery & collection</summary>
            <p>
              Shipping rates and pickup arrangements are awaiting approval. No
              live checkout is available.
            </p>
          </details>
        </div>
      </div>
      {large && (
        <Lightbox onClose={() => setLarge(false)}>
          {media(p.image, p.title + " full front and back mockup")}
        </Lightbox>
      )}
    </>
  );
}
function Field({
  name,
  label,
  type = "text",
  required = false,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label>
      {label}
      {required ? " *" : ""}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={type === "text" ? 500 : undefined}
        {...props}
      />
    </label>
  );
}
function Alert({ message }: { message: string }) {
  return message ? (
    <div className="form-alert" role="status">
      {message}
    </div>
  ) : null;
}
function ContactForm() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMessage("");
    try {
      const r = await api("contact", Object.fromEntries(new FormData(form)));
      setMessage(r.message);
      form.reset();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="paper-form" onSubmit={submit}>
      <h3>Drop us a note.</h3>
      <div className="grid two">
        <Field name="name" label="Your name" required />
        <Field name="email" label="Email address" type="email" required />
      </div>
      <Field name="subject" label="Subject" />
      <Field name="phone" label="Phone (optional)" type="tel" />
      <label>
        What’s on your mind?
        <select name="type">
          {[
            "general",
            "volunteer",
            "partnership",
            "merchandise",
            "donation",
            "other",
          ].map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Your message *
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="checkbox">
        <input type="checkbox" required />I understand this message is stored
        for team review. I won’t include patient or sensitive medical
        information.
      </label>
      <Alert message={message} />
      <button className="button full" disabled={busy}>
        {busy ? "Saving…" : "Send message"} <ArrowUpRight size={18} />
      </button>
      <small>
        This prototype stores messages; it does not send email. Only authorized
        admins can review submissions.
      </small>
    </form>
  );
}
function Checkout({
  cart,
  c,
  onComplete,
}: {
  cart: CartItem[];
  c: Content;
  onComplete: (r: Receipt) => void;
}) {
  const [delivery, setDelivery] = useState(
      c.settings.pickup ? "pickup" : "shipping",
    ),
    [extra, setExtra] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [key] = useState(() => crypto.randomUUID());
  const subtotal = cart.some(
    (i) => c.products.find((p) => p.id === i.id)?.price == null,
  )
    ? null
    : cart.reduce(
        (sum, i) =>
          sum +
          (c.products.find((p) => p.id === i.id)?.price || 0) * i.quantity,
        0,
      );
  const shipping =
    delivery === "pickup" ? c.settings.pickupFee : c.settings.shipping;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const r = await api(
        "checkout",
        {
          ...data,
          delivery,
          donation: Number(data.donation || 0),
          items: cart,
        },
        key,
      );
      onComplete({ ...r, kind: "orders" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!cart.length)
    return (
      <div className="empty-state">
        <h2>Your cart is empty.</h2>
        <Link href="/shop" className="button">
          Explore designs
        </Link>
      </div>
    );
  return (
    <div className="checkout-grid">
      <form className="paper-form" onSubmit={submit}>
        <h3>Your details</h3>
        <div className="grid two">
          <Field name="name" label="Full name" required />
          <Field name="email" label="Email address" type="email" required />
          <Field name="phone" label="Phone number" type="tel" required />
          <Field name="city" label="Province / city" required />
        </div>
        <label>
          Delivery method
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          >
            {c.settings.pickup && (
              <option value="pickup">
                Pickup · fee awaiting configuration
              </option>
            )}
            <option value="shipping">
              Delivery · rate awaiting confirmation
            </option>
          </select>
        </label>
        <label>
          {delivery === "shipping" ? "Delivery address *" : "Pickup notes"}
          <textarea
            name="address"
            rows={3}
            required={delivery === "shipping"}
            minLength={delivery === "shipping" ? 8 : 0}
            maxLength={500}
          />
        </label>
        {delivery === "pickup" && (
          <p className="muted">{c.settings.pickupDetails}</p>
        )}
        <Field
          name="donation"
          label="Optional extra donation (test USD)"
          onChange={(e) => setExtra(Number(e.target.value || 0))}
          type="number"
          min={0}
          max={10000}
          step="0.01"
        />
        <details className="preorder-terms">
          <summary>Preorder terms · awaiting approval</summary>
          <p>{c.settings.fulfillmentWindow}</p>
          <p>{c.settings.refundPolicy}</p>
          <p>{c.settings.shippingPolicy}</p>
          <p>{c.settings.officialContact}</p>
        </details>
        <label className="checkbox">
          <input type="checkbox" required />I understand this is a test order.
          No payment or inventory reservation will occur.
        </label>
        <Alert message={error} />
        <button className="button full" disabled={busy}>
          {busy ? "Creating…" : "Create test order"} <ArrowRight size={18} />
        </button>
      </form>
      <aside className="order-summary">
        <span className="eyebrow">YOUR TEST ORDER</span>
        <h3>A little good in your bag.</h3>
        {cart.map((i) => (
          <div className="summary-line" key={i.id + i.size}>
            <span>
              {c.products.find((p) => p.id === i.id)?.title}
              <small>
                Size {i.size} × {i.quantity}
              </small>
            </span>
            <span>
              {money(
                c.products.find((p) => p.id === i.id)?.price == null
                  ? null
                  : c.products.find((p) => p.id === i.id)!.price! * i.quantity,
              )}
            </span>
          </div>
        ))}
        <div className="summary-line">
          <span>Subtotal</span>
          <strong>{money(subtotal)}</strong>
        </div>
        <div className="summary-line">
          <span>Shipping</span>
          <span>{money(shipping)}</span>
        </div>
        <div className="summary-line">
          <span>Extra donation (separate)</span>
          <span>{money(extra)}</span>
        </div>
        <div className="summary-line total">
          <span>Total</span>
          <strong>
            {money(
              subtotal === null || shipping === null
                ? null
                : subtotal + shipping + extra,
            )}
          </strong>
        </div>
        <p>
          Prices are $10 USD per shirt. Sizes, preorder caps and fees require
          admin configuration. Live checkout stays disabled regardless of test
          totals.
        </p>
        <div className="badge">
          <Lock size={14} /> Test mode · no payment collection
        </div>
      </aside>
    </div>
  );
}
function Donation({ onComplete }: { onComplete: (r: Receipt) => void }) {
  const [amount, setAmount] = useState(10),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [key] = useState(() => crypto.randomUUID());
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const r = await api("donate", { ...data, amount }, key);
      onComplete({ ...r, kind: "donations" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="paper-form" onSubmit={submit}>
      <div className="badge">KHQR TEST MODE · USD DEMONSTRATION</div>
      <h3>A gift of care.</h3>
      <p>
        Choose a sample amount. USD availability must be confirmed with the
        future provider.
      </p>
      <div className="amounts">
        {[5, 10, 25, 50].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={amount === n}
            className={amount === n ? "selected" : ""}
            onClick={() => setAmount(n)}
          >
            ${n}
          </button>
        ))}
      </div>
      <label>
        Custom amount (test USD)
        <input
          type="number"
          min="1"
          max="10000"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </label>
      <Field name="name" label="Your name (optional)" />
      <Field name="email" label="Email (optional)" type="email" />
      <label>
        Dedication or message (optional)
        <textarea name="message" rows={3} maxLength={1000} />
      </label>
      <label className="checkbox">
        <input type="checkbox" required />I understand this is a demo and my
        optional details will be stored for authorized team review.
      </label>
      <Alert message={error} />
      <button className="button full" disabled={busy}>
        {busy ? "Preparing…" : "Preview test KHQR experience"}{" "}
        <Heart size={17} />
      </button>
      <small>
        No money collected. No real donation receipt issued. Details are not
        published.
      </small>
    </form>
  );
}
function ReceiptView() {
  const [ref, setRef] = useState<Receipt | null>(null),
    [record, setRecord] = useState<Record<string, unknown> | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const r = JSON.parse(sessionStorage.getItem("sabai-receipt") || "null");
        if (r) {
          setRef(r);
          fetch("/api/receipt/" + r.id + "?kind=" + r.kind, {
            headers: { "x-receipt-token": r.token },
          })
            .then((r) => r.json())
            .then(setRecord)
            .catch(() => setError("Unable to load test record."));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ref || !record || record.status !== "pending_payment") return;
    const timer = setInterval(() => {
      fetch("/api/receipt/" + ref.id + "?kind=" + ref.kind, {
        headers: { "x-receipt-token": ref.token },
      })
        .then(async (r) => {
          if (!r.ok) throw Error("Status temporarily unavailable");
          return r.json();
        })
        .then(setRecord)
        .catch(() =>
          setError(
            "Status temporarily unavailable. Retry or refresh this page.",
          ),
        );
    }, 5000);
    return () => clearInterval(timer);
  }, [ref, record]);
  async function simulate() {
    if (!ref) return;
    setBusy(true);
    try {
      const r = await api("payments/simulate", ref);
      setRecord((old) => ({ ...old, status: r.status }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section">
      <span className="eyebrow">TEST MODE · NOT A PAYMENT RECEIPT</span>
      <h1>
        {record?.status === "demo_confirmed"
          ? "A little preview of good."
          : "Your test record."}
      </h1>
      {!ref ? (
        <p>
          No test record on this device.{" "}
          <Link href="/donate">Try a test donation.</Link>
        </p>
      ) : (
        <div className="paper-form">
          <div className="demo-qr">
            <Sun size={54} />
            <strong>DEMO</strong>
            <span>NOT A PAYABLE QR</span>
          </div>
          <h3>
            {record?.status === "demo_confirmed"
              ? "Demo confirmation recorded"
              : "Waiting for test simulation"}
          </h3>
          <p>
            No real KHQR code has been created. Do not transfer money for this
            prototype.
          </p>
          <dl>
            <dt>Reference</dt>
            <dd className="break">{ref.id}</dd>
            <dt>Type</dt>
            <dd>
              {ref.kind === "orders"
                ? "Test merchandise order"
                : "Test donation"}
            </dd>
            <dt>Status</dt>
            <dd>{String(record?.status || "Loading…")}</dd>
            <dt>Amount</dt>
            <dd>
              {record?.amountMinor == null
                ? "Unconfigured"
                : money(Number(record.amountMinor) / 100)}{" "}
              · TEST USD
            </dd>
          </dl>
          {record?.status === "pending_payment" && (
            <button className="button" onClick={simulate} disabled={busy}>
              {busy ? "Simulating…" : "Simulate test confirmation"}
            </button>
          )}
          {record?.status === "pending_payment" && (
            <button
              className="text-link"
              onClick={async () => {
                if (!ref) return;
                try {
                  const r = await api("payments/cancel", ref);
                  setRecord((old) => ({ ...old, status: r.status }));
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Cancel test payment
            </button>
          )}
          <p className="muted">
            {record?.expiresAt
              ? "Test intent expires: " +
                new Date(String(record.expiresAt)).toLocaleString()
              : ""}
          </p>
          <Alert message={error} />
          <p className="muted">
            A simulation never marks a real payment paid. No tax receipt is
            issued. Real confirmations require signed and reconciled provider
            verification.
          </p>
          <button className="text-link" onClick={() => window.print()}>
            Print test record
          </button>
        </div>
      )}
    </section>
  );
}
type AdminRecord = {
  id: string;
  status: string;
  mode?: string;
  name?: string;
  email?: string;
  amountMinor?: number;
  totals?: { subtotal: number | null; donation: number };
  message?: string;
  createdAt?: string;
  [key: string]: unknown;
};
type AdminData = {
  content: Content;
  orders: AdminRecord[];
  donations: AdminRecord[];
  contacts: AdminRecord[];
  audit: Record<string, unknown>[];
};
function Admin({ onContent }: { onContent: (c: Content) => void }) {
  const [data, setData] = useState<AdminData | null>(null),
    [draft, setDraft] = useState<Content | null>(null),
    [tab, setTab] = useState("Overview"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const tabs = [
    "Overview",
    "Pages",
    "Projects",
    "Products",
    "Campaigns",
    "Teams",
    "Impact",
    "Settings",
    "Translations",
    "Media",
    "Orders",
    "Donations",
    "Contacts",
    "Audit",
  ];
  async function load() {
    const d = await api("admin");
    setData(d);
    setDraft(d.content);
  }
  async function initialLoad() {
    try {
      await load();
    } catch {}
  }
  useEffect(() => {
    void initialLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api(
        "auth/login",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      await api("admin/content", draft);
      setMessage("Content saved. Refresh public pages to see updates.");
      onContent(draft);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function status(kind: string, id: string, status: string) {
    try {
      await api("admin/status", { kind, id, status });
      await load();
      setMessage("Status updated.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  if (!data || !draft)
    return (
      <div className="admin-login">
        <div>
          <span className="eyebrow">FOR THE TEAM</span>
          <h1>
            A home for
            <br />
            the good work.
          </h1>
          <p>
            Manage stories, designs, enquiries and test records in one place.
          </p>
          <Lock size={56} strokeWidth={1} />
        </div>
        <form className="paper-form" onSubmit={login}>
          <span className="badge">SECURE ADMIN ACCESS</span>
          <h2>Welcome back.</h2>
          <Field
            name="email"
            label="Admin email (Supabase accounts)"
            type="email"
          />
          <Field name="password" label="Password" type="password" required />
          <Alert message={message} />
          <button className="button full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"} <ArrowRight size={18} />
          </button>
          <button
            type="button"
            className="text-link"
            onClick={async (e) => {
              const form = e.currentTarget.form;
              try {
                const r = await api("auth/reset", {
                  email: (form?.elements.namedItem("email") as HTMLInputElement)
                    ?.value,
                });
                setMessage(r.message);
              } catch (err) {
                setMessage((err as Error).message);
              }
            }}
          >
            Forgot your password?
          </button>
          <small>
            Configure Supabase Auth for production. A password supplied through
            ADMIN_PASSWORD is supported only in local development. There are no
            default credentials.
          </small>
        </form>
      </div>
    );
  const groupMap: Record<string, keyof Content> = {
    Projects: "projects",
    Products: "products",
    Campaigns: "campaigns",
    Teams: "teams",
    Impact: "impact",
  };
  const group = groupMap[tab];
  function setGroup(items: unknown[]) {
    setDraft({ ...draft!, [group]: items });
  }
  function editValue(
    value: unknown,
    onChange: (v: unknown) => void,
    label: string,
  ) {
    if (typeof value === "boolean")
      return (
        <label className="checkbox" key={label}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          {label}
        </label>
      );
    if (Array.isArray(value))
      return (
        <label key={label}>
          {label} (one per line)
          <textarea
            rows={3}
            value={value.join("\n")}
            onChange={(e) =>
              onChange(e.target.value.split("\n").filter(Boolean))
            }
          />
        </label>
      );
    if (typeof value === "number" || value === null)
      return (
        <label key={label}>
          {label} (blank = unconfigured)
          <input
            type="number"
            min="0"
            step={label === "stock" ? "1" : "0.01"}
            value={value === null ? "" : String(value)}
            onChange={(e) =>
              onChange(e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </label>
      );
    return (
      <label key={label}>
        {label}
        <textarea
          rows={String(value).length > 140 ? 4 : 2}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  return (
    <section className="section admin">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            TEAM WORKSPACE · {data.orders.length + data.donations.length}{" "}
            RECORDS
          </span>
          <h1>Good work, organized.</h1>
        </div>
        <button
          className="button light"
          onClick={async () => {
            await api("auth/logout", {});
            setData(null);
            setDraft(null);
          }}
        >
          Sign out
        </button>
      </div>
      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => {
              setTab(t);
              setMessage("");
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <Alert message={message} />
      {tab === "Overview" && (
        <>
          <div className="grid three admin-stats">
            <Feature
              icon={<ShoppingBag />}
              title={String(data.orders.length) + " orders"}
              text="Includes test records; no stock reserved."
            />
            <Feature
              icon={<Heart />}
              title={
                money(
                  data.donations
                    .filter((r) => r.mode !== "test" && r.status === "paid")
                    .reduce((n, r) => n + (r.amountMinor || 0) / 100, 0),
                ) + " donations"
              }
              text="Verified real donations only. Test donations are excluded."
            />
            <Feature
              icon={<Mail />}
              title={
                String(data.contacts.filter((r) => r.status === "new").length) +
                " new enquiries"
              }
              text="Stored messages awaiting team review."
            />
          </div>
          <div className="info-banner">
            <ShieldCheck />
            <div>
              <strong>
                Real merchandise revenue:{" "}
                {money(
                  data.orders
                    .filter((r) => r.mode !== "test" && r.status === "paid")
                    .reduce((n, r) => n + (r.totals?.subtotal || 0) / 100, 0),
                )}
              </strong>
              <p>
                Payment collection is disabled. The dashboard cannot manually
                mark payments paid. Media consent and official content must be
                verified before launch.
              </p>
            </div>
          </div>
        </>
      )}
      {tab === "Pages" && (
        <div className="paper-form">
          {Object.entries(draft.pages).map(([k, v]) =>
            editValue(
              v,
              (x) => setDraft({ ...draft, pages: { ...draft.pages, [k]: x } }),
              k,
            ),
          )}
        </div>
      )}
      {group && (
        <div className="admin-editor">
          {(draft[group] as unknown as Record<string, unknown>[]).map(
            (item, i) => (
              <details className="editor-card" key={i} open={i === 0}>
                <summary>
                  {String(item.title || item.label || item.id)}{" "}
                  <span>Edit record</span>
                </summary>
                <div className="grid two">
                  {Object.entries(item).map(([k, v]) =>
                    editValue(
                      v,
                      (x) =>
                        setGroup(
                          (
                            draft[group] as unknown as Record<string, unknown>[]
                          ).map((r, j) => (i === j ? { ...r, [k]: x } : r)),
                        ),
                      k,
                    ),
                  )}
                </div>
                {group === "products" && (
                  <p className="muted">
                    Image fields are filenames in the media library. Front/back
                    optional views can be added below; leave blank when
                    unavailable.
                  </p>
                )}
                {group === "products" &&
                  ["frontImage", "backImage"]
                    .filter((k) => !(k in item))
                    .map((k) => (
                      <button
                        key={k}
                        className="text-link"
                        onClick={() =>
                          setGroup(
                            (
                              draft[group] as unknown as Record<
                                string,
                                unknown
                              >[]
                            ).map((r, j) => (i === j ? { ...r, [k]: "" } : r)),
                          )
                        }
                      >
                        + Add {k}
                      </button>
                    ))}
                <button
                  className="danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this record? Save changes to apply.",
                      )
                    )
                      setGroup(
                        (draft[group] as unknown[]).filter((_, j) => j !== i),
                      );
                  }}
                >
                  Remove record
                </button>
              </details>
            ),
          )}
          <button
            className="button light"
            onClick={() => {
              const id = "new-" + crypto.randomUUID().slice(0, 8);
              const defaults: Record<string, unknown> = {
                projects: {
                  id,
                  title: "New project",
                  location: "To confirm",
                  year: "To confirm",
                  status: "Upcoming",
                  topic: "Community",
                  type: "Draft",
                  description: "",
                  goals: [],
                  dates: "To confirm",
                  activities: [],
                  gallery: [],
                  milestones: [],
                  outcomes: "Awaiting verification",
                  featured: false,
                  published: false,
                },
                products: {
                  id,
                  title: "New product",
                  description: "",
                  image: "",
                  sizes: [],
                  color: "To confirm",
                  preorder: true,
                  rightsRequired: false,
                  price: 10,
                  stock: null,
                  published: false,
                },
                campaigns: {
                  id,
                  title: "New in-kind campaign",
                  type: "in-kind",
                  status: "Draft",
                  year: "To confirm",
                  description: "",
                  items: [],
                  instructions: "Awaiting approval",
                  contact: "To confirm",
                  image: "",
                  published: false,
                },
                teams: {
                  id,
                  title: "New team",
                  description: "",
                  name: "",
                  image: "",
                  published: false,
                },
                impact: {
                  id,
                  label: "New metric",
                  value: "—",
                  verified: false,
                },
              };
              setGroup([...(draft[group] as unknown[]), defaults[group]]);
            }}
          >
            Add {tab.toLowerCase().replace(/s$/, "")} <Plus size={17} />
          </button>
        </div>
      )}
      {tab === "Settings" && (
        <div className="paper-form">
          {Object.entries(draft.settings).map(([k, v]) =>
            k === "currency" ? (
              <p key={k}>
                Currency: USD (test only; live currency requires provider
                review)
              </p>
            ) : (
              editValue(
                v,
                (x) =>
                  setDraft({
                    ...draft,
                    settings: { ...draft.settings, [k]: x },
                  }),
                k,
              )
            ),
          )}
        </div>
      )}
      {tab === "Translations" && (
        <div className="paper-form">
          <p>
            English and Khmer dictionaries. Missing translations fall back to
            English.
          </p>
          {Object.entries(draft.translations).map(([locale, values]) => (
            <details key={locale}>
              <summary>{locale}</summary>
              {Object.entries(values).map(([k, v]) =>
                editValue(
                  v,
                  (x) =>
                    setDraft({
                      ...draft,
                      translations: {
                        ...draft.translations,
                        [locale]: { ...values, [k]: String(x) },
                      },
                    }),
                  k,
                ),
              )}
            </details>
          ))}
        </div>
      )}
      {tab === "Media" && (
        <div className="paper-form">
          <h3>Internal media library</h3>
          <p>
            All five original reference files are preserved intact under
            references/. Do not approve public display until the organization
            and relevant people have consented.
          </p>
          <MediaManager />
          <p>
            Uploaded filenames can be assigned in product, team and project
            image fields. Global public media approval is controlled server-side
            by MEDIA_APPROVED, never by a browser toggle.
          </p>
        </div>
      )}
      {["Orders", "Donations", "Contacts"].includes(tab) && (
        <div className="record-list">
          {data[tab.toLowerCase() as "orders" | "donations" | "contacts"]
            .length === 0 ? (
            <div className="empty-state">No records yet.</div>
          ) : (
            data[tab.toLowerCase() as "orders" | "donations" | "contacts"].map(
              (r) => (
                <details className="editor-card" key={r.id}>
                  <summary>
                    {r.name || "Anonymous"} · {r.status}{" "}
                    {r.mode === "test" ? "· TEST" : ""}
                    <small>{r.createdAt}</small>
                  </summary>
                  <pre>
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(r).filter(
                          ([k]) => !["hash", "token"].includes(k),
                        ),
                      ),
                      null,
                      2,
                    )}
                  </pre>
                  {tab !== "Donations" && (
                    <label>
                      Update {tab === "Contacts" ? "review" : "fulfillment"}{" "}
                      status
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value)
                            void status(
                              tab.toLowerCase(),
                              r.id,
                              e.target.value,
                            );
                        }}
                      >
                        <option value="">Choose next status</option>
                        {(tab === "Contacts"
                          ? ["new", "reviewed", "archived"]
                          : [
                              "processing",
                              "ready_for_pickup",
                              "shipped",
                              "delivered",
                              "cancelled",
                            ]
                        ).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </details>
              ),
            )
          )}
        </div>
      )}
      {tab === "Audit" && (
        <div className="paper-form">
          <h3>Audit trail</h3>
          <pre>{JSON.stringify(data.audit, null, 2)}</pre>
        </div>
      )}
      {[
        "Pages",
        "Projects",
        "Products",
        "Campaigns",
        "Teams",
        "Impact",
        "Settings",
        "Translations",
      ].includes(tab) && (
        <div className="save-bar">
          <button className="button" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"} <Check size={17} />
          </button>
          <span>Edits are stored in the database after validation.</span>
        </div>
      )}
    </section>
  );
}
function MediaManager() {
  const [files, setFiles] = useState<string[]>([]),
    [message, setMessage] = useState("");
  async function refresh() {
    try {
      setFiles((await api("admin/media")).files);
    } catch {}
  }
  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = e.currentTarget;
          try {
            const r = await fetch("/api/admin/media", {
              method: "POST",
              body: new FormData(f),
            });
            const b = await r.json();
            if (!r.ok) throw Error(b.error);
            setMessage("Uploaded " + b.name);
            f.reset();
            await refresh();
          } catch (err) {
            setMessage((err as Error).message);
          }
        }}
      >
        <label>
          Upload approved or internal image (PNG, WebP, JPEG; max 5 MB)
          <input
            name="file"
            type="file"
            accept="image/png,image/webp,image/jpeg"
            required
          />
        </label>
        <button className="button light">Upload image</button>
      </form>
      <Alert message={message} />
      <div className="grid three media-library">
        {files.map((name) => (
          <a
            key={name}
            href={"/api/media/" + name}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={"/api/media/" + name}
              width={250}
              height={250}
              alt={"Internal reference: " + name}
              unoptimized
            />
            <small>{name}</small>
          </a>
        ))}
      </div>
    </>
  );
}

function PasswordReset() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="section">
      <h1>Reset your password.</h1>
      <form
        className="paper-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const token = new URLSearchParams(
              window.location.hash.slice(1),
            ).get("access_token");
            if (!token)
              throw Error("Open a valid recovery link from your email first.");
            await api("auth/recovery", {
              accessToken: token,
              password: new FormData(e.currentTarget).get("password"),
            });
            window.history.replaceState(null, "", "/admin/reset");
            setMessage(
              "Password updated. You can sign in with your new password.",
            );
          } catch (err) {
            setMessage((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field
          name="password"
          label="New password (at least 12 characters)"
          type="password"
          required
        />
        <Alert message={message} />
        <button className="button" disabled={busy}>
          Update password
        </button>
        <p>
          <Link href="/admin" className="text-link">
            Back to sign in
          </Link>
        </p>
      </form>
    </section>
  );
}

function PolicyPage({
  path,
  settings,
}: {
  path: string;
  settings: Content["settings"];
}) {
  return (
    <>
      <span className="eyebrow">PROTOTYPE POLICIES · NO LIVE TRANSACTIONS</span>
      <p>
        {path === "/privacy"
          ? settings.privacyPolicy
          : path === "/shipping"
            ? settings.shippingPolicy
            : settings.refundPolicy}
      </p>
      <h1>
        {path === "/privacy"
          ? "Your privacy matters."
          : path === "/shipping"
            ? "Shipping & preorders."
            : "Returns & refunds."}
      </h1>
      {path === "/privacy" ? (
        <>
          <p>
            This prototype stores contact messages, optional donor details and
            test checkout details in a server database. Authorized team
            administrators can review them. Cart selections are stored on your
            device and test receipt access is stored for your browser session.
            We do not request bank credentials or store patient records.
          </p>
          <p>
            Use fictitious information for testing. Do not submit medical
            information. A verified organization contact, retention period and
            data rights procedure must be configured before public launch. No
            advertising or analytics trackers are installed.
          </p>
          <Link href="/contact" className="text-link">
            Contact the team
          </Link>
        </>
      ) : (
        <>
          <p>
            No real orders, payments or inventory reservations are accepted.
            Product prices, stock, size charts, shipping fees, collection
            arrangements and fulfillment windows must be confirmed by the
            organization.
          </p>
          <p>
            {path === "/shipping"
              ? "Delivery regions, preorder timeframes and pickup instructions are awaiting approval. No delivery date is promised by this prototype."
              : "Cancellation windows, refund eligibility and the refund process are awaiting organizational approval. No actual payments have been collected through this prototype."}
          </p>
          <p>
            Live transactions must remain disabled until the required
            operational policies are approved and published.
          </p>
          <Link href="/contact" className="text-link">
            Ask a question
          </Link>
        </>
      )}
    </>
  );
}

function Lightbox({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.showModal();
    return () => {
      el?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-label="Full product mockup"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button className="button" onClick={onClose}>
        Close <X size={18} />
      </button>
      <div>{children}</div>
    </dialog>
  );
}

function ShopCatalog({
  products,
  render,
}: {
  products: Product[];
  render: (p: Product[]) => React.ReactNode;
}) {
  const [query, setQuery] = useState(""),
    [color, setColor] = useState("All"),
    [sort, setSort] = useState("featured");
  const filtered = products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) &&
        (color === "All" || p.color === color),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : sort === "price"
          ? (a.price || 0) - (b.price || 0)
          : 0,
    );
  return (
    <>
      <div className="catalog-filters">
        <label>
          Find your design
          <input
            value={query}
            placeholder="Search designs…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Color
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            <option>All</option>
            {[...new Set(products.map((p) => p.color))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="name">Name A–Z</option>
            <option value="price">Price low–high</option>
          </select>
        </label>
      </div>
      <p className="muted">
        {filtered.length} unique designs · $10 USD each · Pre-order · Test mode
      </p>
      <div className="grid two shop-grid">{render(filtered)}</div>
      {!filtered.length && (
        <div className="empty-state">No designs match your search.</div>
      )}
    </>
  );
}
function Campaigns({
  campaigns,
  media,
}: {
  campaigns: Content["campaigns"];
  media: (n: string, a: string) => React.ReactNode;
}) {
  if (!campaigns.length) return null;
  return (
    <section className="section">
      <span className="eyebrow">GOOD CAN TAKE MANY FORMS</span>
      <h2>Give a story. Share possibility.</h2>
      <div className="grid two">
        {campaigns.map((p) => (
          <article className="campaign-card" key={p.id}>
            <span className="badge">IN-KIND DONATION · {p.status}</span>
            {p.image ? (
              media(p.image, p.title)
            ) : (
              <div className="campaign-placeholder">
                <BookOpen size={58} strokeWidth={1} />
                <span>Campaign poster not supplied</span>
              </div>
            )}
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <small>{p.year}</small>
            <h4>Reported accepted items</h4>
            <ul>
              {p.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p>{p.instructions}</p>
            <p className="muted">{p.contact}</p>
            <small>
              No bank QR or payment account has been derived from this campaign.
            </small>
            <Link className="text-link" href="/contact">
              Ask about in-kind giving <ArrowUpRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
