import Link from "next/link";
import source from "../../../../docs/source-products.json";

type Product = (typeof source.products)[number];
const products = source.products;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.path.replace(/^\/p\//, "").split("/") }));
}

function findProduct(slug: string[]) {
  const path = `/p/${slug.join("/")}`;
  return products.find((product) => product.path === path);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const product = findProduct((await params).slug);
  if (!product) return <main className="detail-page"><h1>Product not found</h1><Link href="/">Back to catalog</Link></main>;
  const data = product.upgates_product;
  const category = data?.category?.title ?? "Other";
  return <main className="detail-page">
    <nav className="detail-nav"><Link className="logo" href="/"><span>zem</span>bag<span className="dot">.</span></Link><Link href="/">← Back to catalog</Link><Link href="/admin">Admin</Link></nav>
    <div className="detail-layout">
      <section className="detail-media"><div className="detail-art"><div className="mini-bag"><span>zem</span><small>bag</small></div></div><p className="eyebrow">SOURCE MEDIA</p><div className="media-list">{product.images.slice(0, 8).map((image) => <a href={image} target="_blank" rel="noreferrer" key={image}><img src={image} alt={data?.title ?? "Zembag product"} /></a>)}</div></section>
      <section className="detail-copy"><p className="eyebrow">{category}</p><h1>{data?.title ?? product.path}</h1><p className="detail-code">{data?.code ?? "—"} · {data?.manufacturer ?? "—"}</p><div className="detail-price"><strong>EUR pending</strong><span>Malta price will be set separately in admin.</span></div><button className="button dark">Add to cart <span>+</span></button><div className="source-note"><h2>Product information</h2><dl><dt>Source price incl. VAT</dt><dd>{data?.price?.withVat ?? "—"} CZK</dd><dt>Source price excl. VAT</dt><dd>{data?.price?.withoutVat ?? "—"} CZK</dd><dt>VAT rate</dt><dd>{data?.price?.vatRate ?? "—"}%</dd><dt>Availability</dt><dd>{product.availability}</dd><dt>Source page</dt><dd><a href={product.source_url} target="_blank" rel="noreferrer">Open zembag.cz ↗</a></dd></dl></div><p className="licence-note">Imported reference data. Product content and media are retained as source material for the authorized Malta distribution webshop.</p></section>
    </div>
  </main>;
}
