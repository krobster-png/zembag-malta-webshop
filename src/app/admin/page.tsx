import fs from "node:fs/promises";
import path from "node:path";

type Product = { path: string; availability?: string; upgates_product?: { title?: string; code?: string; category?: { title?: string }; price?: { withVat?: number } } };

async function products(): Promise<Product[]> {
  const file = path.join(process.cwd(), "docs/source-products.json");
  return (JSON.parse(await fs.readFile(file, "utf8")) as { products: Product[] }).products;
}

export default async function AdminPage() {
  const items = await products();
  const categories = new Set(items.map((x) => x.upgates_product?.category?.title).filter(Boolean));
  return <main style={{ minHeight: "100vh", background: "#f4f0e9", color: "#173c3a", padding: "48px 6vw", fontFamily: "Arial, sans-serif" }}>
    <header style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 36 }}><div><small style={{ color: "#d9653b", letterSpacing: ".16em", fontWeight: 700 }}>ZEMBAG MALTA · ADMIN</small><h1 style={{ fontSize: 48, letterSpacing: "-.05em", margin: "10px 0" }}>Catalog control center</h1><p style={{ color: "#68766f" }}>Source catalog is reference data. Malta prices remain independently editable.</p></div><a href="/" style={{ color: "#173c3a", fontWeight: 700 }}>← storefront</a></header>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>{[["SOURCE PRODUCTS", items.length, "Imported from zembag.cz"], ["CATEGORIES", categories.size, "Detected source taxonomy"], ["MALTA PRICE STATUS", "Not set", "EUR prices require approval"]].map(([label, value, note]) => <article key={String(label)} style={{ background: "#fffdf9", border: "1px solid #d9d4c9", borderRadius: 18, padding: 24 }}><small style={{ color: "#8b6a39", letterSpacing: ".12em", fontWeight: 700 }}>{label}</small><strong style={{ display: "block", fontSize: 32, margin: "12px 0 4px" }}>{value}</strong><span style={{ color: "#778179", fontSize: 13 }}>{note}</span></article>)}</section>
    <section style={{ background: "#fffdf9", border: "1px solid #d9d4c9", borderRadius: 18, padding: 24, overflow: "auto" }}><h2 style={{ marginTop: 0 }}>Imported products</h2><table style={{ width: "100%", minWidth: 820, borderCollapse: "collapse", textAlign: "left" }}><thead><tr>{["Product", "Code", "Category", "Source CZK", "Malta EUR", "Availability"].map((x) => <th key={x} style={{ padding: 12, borderBottom: "1px solid #e8e2d8", fontSize: 11, color: "#7b827a" }}>{x}</th>)}</tr></thead><tbody>{items.map((item) => { const p = item.upgates_product; return <tr key={item.path}><td style={{ padding: 12, borderBottom: "1px solid #e8e2d8" }}>{p?.title ?? item.path}</td><td style={{ padding: 12, borderBottom: "1px solid #e8e2d8" }}>{p?.code ?? "—"}</td><td style={{ padding: 12, borderBottom: "1px solid #e8e2d8" }}>{p?.category?.title ?? "—"}</td><td style={{ padding: 12, borderBottom: "1px solid #e8e2d8" }}>{p?.price?.withVat ?? "—"} Kč</td><td style={{ padding: 12, borderBottom: "1px solid #e8e2d8", color: "#a05b4d", fontWeight: 700 }}>Not set</td><td style={{ padding: 12, borderBottom: "1px solid #e8e2d8" }}>{item.availability}</td></tr> })}</tbody></table></section>
  </main>;
}
