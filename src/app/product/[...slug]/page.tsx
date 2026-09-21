import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import source from "../../../../docs/source-products.json";
import mediaManifest from "../../../../docs/media-manifest.json";

type Product = (typeof source.products)[number];
const products = source.products;
const productMedia = (product: Product) => product.images.slice(16);

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.path.replace(/^\/p\//, "").split("/") }));
}

function findProduct(slug: string[]) {
  const path = `/${slug[0] === "p" ? slug.join("/") : `p/${slug.join("/")}`}`;
  return products.find((product) => product.path === path);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const sourceProduct = findProduct((await params).slug);
  const canonicalPath = sourceProduct?.path;
  const dbProduct: any = canonicalPath ? await prisma.product.findFirst({ where: { sourceUrl: `https://www.zembag.cz${canonicalPath}` }, include: { translations: { where: { locale: "CS" } }, categories: { include: { category: { include: { translations: { where: { locale: "CS" } } } } } }, media: { orderBy: { sortOrder: "asc" } }, prices: { where: { currency: "CZK" }, orderBy: { validFrom: "desc" }, take: 1 }, inventory: true } }) : null;
  const product: any = sourceProduct ? (dbProduct ? { ...sourceProduct, source_url: dbProduct.sourceUrl || sourceProduct.source_url, availability: dbProduct.inventory?.source || sourceProduct.availability, images: dbProduct.media.map((media: { url: string }) => media.url), upgates_product: { ...sourceProduct.upgates_product, title: dbProduct.translations[0]?.name, code: dbProduct.sku, manufacturer: dbProduct.manufacturer, price: { ...sourceProduct.upgates_product?.price, withVat: dbProduct.prices[0] ? dbProduct.prices[0].amountMinor / 100 : sourceProduct.upgates_product?.price?.withVat, vatRate: dbProduct.taxRate ? Number(dbProduct.taxRate) : sourceProduct.upgates_product?.price?.vatRate }, category: { title: dbProduct.categories[0]?.category.translations[0]?.name || sourceProduct.upgates_product?.category?.title } } } : sourceProduct) : null;
  if (!product) return <main className="detail-page"><h1>Product not found</h1><Link href="/">Back to catalog</Link></main>;
  const data = product.upgates_product;
  const category = data?.category?.title ?? "Other";
  const localMedia = new Map(mediaManifest.media.map((media) => [media.source_url, media.local_path]));
  return <main className="detail-page">
    <nav className="detail-nav"><Link className="logo" href="/"><span>zem</span>bag<span className="dot">.</span></Link><Link href="/">← Back to catalog</Link><Link href="/admin">Admin</Link></nav>
    <div className="detail-layout">
      <section className="detail-media"><div className="detail-art"><div className="mini-bag"><span>zem</span><small>bag</small></div></div><p className="eyebrow">SOURCE MEDIA</p><div className="media-list">{productMedia(product).slice(0, 8).map((image) => { const local = localMedia.get(image); return <a href={local ? `/${local.replace(/^public\//, "")}` : image} target="_blank" rel="noreferrer" key={image}><img src={local ? `/${local.replace(/^public\//, "")}` : image} alt={data?.title ?? "Zembag product"} /></a>; })}</div></section>
      <section className="detail-copy"><p className="eyebrow">{category}</p><h1>{data?.title ?? product.path}</h1><p className="detail-code">{data?.code ?? "—"} · {data?.manufacturer ?? "—"}</p><div className="detail-price"><strong>EUR pending</strong><span>Malta price will be set separately in admin.</span></div><button className="button dark">Add to cart <span>+</span></button><div className="source-note"><h2>Product information</h2><dl><dt>Source price incl. VAT</dt><dd>{data?.price?.withVat ?? "—"} CZK</dd><dt>Source price excl. VAT</dt><dd>{data?.price?.withoutVat ?? "—"} CZK</dd><dt>VAT rate</dt><dd>{data?.price?.vatRate ?? "—"}%</dd><dt>Availability</dt><dd>{product.availability}</dd><dt>Source page</dt><dd><a href={product.source_url} target="_blank" rel="noreferrer">Open zembag.cz ↗</a></dd></dl></div><p className="licence-note">Imported reference data. Product content and media are retained as source material for the authorized Malta distribution webshop.</p></section>
    </div>
  </main>;
}
