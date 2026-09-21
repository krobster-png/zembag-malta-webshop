"use client";

import { useState } from "react";

type Locale = "en" | "cs" | "mt";
const copy = {
  en: { eyebrow: "SMART STORAGE FOR YOUR HARVEST", title: "Fresh potatoes.\\nLess waste.", intro: "Natural, reusable storage bags designed to keep your potatoes and vegetables fresh for longer.", shop: "Shop products", learn: "How Zembag works", featured: "Featured products", delivery: "Delivery across Malta", deliveryText: "Simple local delivery, clear pricing and support in English, Czech and Maltese.", cart: "Cart", select: "Language" },
  cs: { eyebrow: "CHYTRÉ SKLADOVÁNÍ ÚRODY", title: "Čerstvé brambory.\\nMéně odpadu.", intro: "Přírodní opakovaně použitelné pytle, které pomáhají udržet brambory a zeleninu déle čerstvé.", shop: "Prohlédnout produkty", learn: "Jak Zembag funguje", featured: "Doporučené produkty", delivery: "Doručení po Maltě", deliveryText: "Jednoduché místní doručení, jasné ceny a podpora v angličtině, češtině a maltštině.", cart: "Košík", select: "Jazyk" },
  mt: { eyebrow: "ĦAŻNA INTELLIĠENTI TAL-ĦSAD", title: "Patata friska.\\nInqas skart.", intro: "Boroż naturali u li jistgħu jerġgħu jintużaw biex iżommu l-patata u l-ħxejjex friski għal aktar żmien.", shop: "Ixtri l-prodotti", learn: "Kif jaħdem Zembag", featured: "Prodotti magħżula", delivery: "Kunsinna madwar Malta", deliveryText: "Kunsinna lokali sempliċi, prezzijiet ċari u appoġġ bl-Ingliż, biċ-Ċek u bil-Malti.", cart: "Cart", select: "Lingwa" },
};
const products = [
  { name: "Zembag Garlic", size: "0.75 kg", price: "€19.90", tone: "gold" },
  { name: "Zembag Potato", size: "2.5 kg", price: "€29.90", tone: "green" },
  { name: "Zembox", size: "up to 20 kg", price: "€49.90", tone: "clay" },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [cartCount, setCartCount] = useState(0);
  const t = copy[locale];
  return <main>
    <div className="announcement">Free delivery across Malta on orders over €50</div>
    <nav className="nav"><a className="logo" href="#top"><span>zem</span>bag<span className="dot">.</span></a><div className="navlinks"><a href="#products">Products</a><a href="#story">Our story</a><a href="#contact">Contact</a></div><div className="actions"><label className="language">{t.select}<select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="en">EN</option><option value="cs">CS</option><option value="mt">MT</option></select></label><button className="cart">{t.cart} <b>{cartCount}</b></button></div></nav>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">{t.eyebrow}</p><h1>{t.title.split("\n").map((line, i) => <span key={line}>{line}{i === 0 && <br/>}</span>)}</h1><p className="intro">{t.intro}</p><div className="hero-buttons"><a className="button dark" href="#products">{t.shop} <span>↗</span></a><a className="text-button" href="#story">{t.learn} <span>↓</span></a></div></div><div className="hero-art"><div className="sun"></div><div className="bag-shape"><div className="bag-label">ZEM<br/><small>bag</small></div><div className="bag-seam"></div></div><div className="leaf leaf-one">✦</div><div className="leaf leaf-two">✦</div></div></section>
    <section className="promise"><div><strong>01</strong><span>Natural materials</span></div><div><strong>02</strong><span>Longer freshness</span></div><div><strong>03</strong><span>Less food waste</span></div><div><strong>04</strong><span>Made to reuse</span></div></section>
    <section id="products" className="products"><div className="section-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>{t.featured}</h2></div><a className="text-button" href="#products">View all <span>↗</span></a></div><div className="product-grid">{products.map(product => <article className="product" key={product.name}><div className={`product-image ${product.tone}`}><div className="mini-bag"><span>zem</span><small>bag</small></div><span className="product-tag">{product.size}</span></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.size}</p></div><strong>{product.price}</strong></div><button className="add" onClick={() => setCartCount(n => n + 1)}>Add to cart <span>+</span></button></article>)}</div></section>
    <section id="story" className="story"><div className="story-art"><div className="story-circle"></div><div className="story-stem">❧</div></div><div><p className="eyebrow">WHY ZEMBAG</p><h2>A better home for your harvest.</h2><p>Zembag combines natural jute, thoughtful design and a simple breathing system. Store it in your kitchen, use it season after season and waste less food.</p><a className="button light" href="#contact">Discover our story <span>↗</span></a></div></section>
    <section className="delivery"><p className="eyebrow">MADE FOR MALTA</p><h2>{t.delivery}</h2><p>{t.deliveryText}</p></section>
    <footer id="contact"><a className="logo" href="#top"><span>zem</span>bag<span className="dot">.</span></a><p>© 2026 Zembag Malta · Independent local webshop</p><div><a href="#contact">Privacy</a><a href="#contact">Terms</a><a href="#contact">Contact</a></div></footer>
  </main>;
}
