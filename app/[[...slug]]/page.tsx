import { notFound } from "next/navigation";
import { content } from "@/lib/store";
import { catalogVisible } from "@/lib/validation";
import Site from "@/app/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const names: Record<string, string> = {
    about: "About Us",
    projects: "Projects & Impact",
    shop: "Shop for a Cause",
    donate: "Donate · Test mode",
    contact: "Contact",
    cart: "Your Cart",
    checkout: "Test Checkout",
    admin: "Admin Dashboard",
  };
  return { title: names[slug?.[0] || ""] || "One Goal, One Heart" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const c = await content();
  if (
    slug.length &&
    (![
      "about",
      "projects",
      "shop",
      "cart",
      "checkout",
      "donate",
      "contact",
      "admin",
      "receipt",
      "privacy",
      "shipping",
      "returns",
    ].includes(slug[0]) ||
      slug.length > 2)
  )
    notFound();
  const preview =
    process.env.NODE_ENV !== "production" ||
    process.env.INTERNAL_PREVIEW === "true";
  const safe = {
    ...c,
    products: c.products.filter((p) => catalogVisible(p, preview)),
    campaigns: c.campaigns.filter((p) => preview || p.published),
    projects: c.projects.filter((p) => p.published),
    teams: c.teams.filter((p) => p.published),
  };
  if (
    slug[0] === "projects" &&
    slug[1] &&
    !safe.projects.some((p) => p.id === slug[1])
  )
    notFound();
  if (
    slug[0] === "shop" &&
    slug[1] &&
    !safe.products.some((p) => p.id === slug[1])
  )
    notFound();
  return (
    <Site
      initial={safe}
      preview={preview}
      mediaApproved={process.env.MEDIA_APPROVED === "true"}
    />
  );
}
