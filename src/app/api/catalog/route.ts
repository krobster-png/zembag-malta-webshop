import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await prisma.product.findMany({ include: { translations: { where: { locale: "CS" } }, categories: { include: { category: { include: { translations: { where: { locale: "CS" } } } } } }, media: { orderBy: { sortOrder: "asc" } }, prices: { orderBy: { validFrom: "desc" } }, inventory: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ products: products.map((product) => { const sourcePrice = product.prices.find((price) => price.currency === "CZK"); const maltaPrice = product.prices.find((price) => price.currency === "EUR"); return { path: product.sourceUrl ? new URL(product.sourceUrl).pathname : `/${product.slug}`, source_url: product.sourceUrl, availability: product.inventory?.source ?? "Imported", images: product.media.map((media) => new URL(media.url, "http://local").pathname), upgates_product: { id: product.sourceId, code: product.sku, title: product.translations[0]?.name, manufacturer: product.manufacturer, price: { withVat: sourcePrice ? sourcePrice.amountMinor / 100 : null, malta: maltaPrice ? maltaPrice.amountMinor / 100 : null, vatRate: product.taxRate ? Number(product.taxRate) : null }, category: { title: product.categories[0]?.category.translations[0]?.name ?? "Other" } } }; }) });
}
