const { PrismaClient, ProductStatus, PriceType, MediaKind, AuditAction } = require('@prisma/client');
const fs = require('node:fs');
const crypto = require('node:crypto');

const prisma = new PrismaClient();
const catalog = JSON.parse(fs.readFileSync('docs/source-products.json', 'utf8')).products;
const manifest = JSON.parse(fs.readFileSync('docs/media-manifest.json', 'utf8'));
const mediaBySource = new Map(manifest.media.map((item) => [item.source_url, item]));
const slug = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  const sourceImport = await prisma.sourceImport.create({ data: { source: 'https://www.zembag.cz', itemCount: catalog.length, checksum: crypto.createHash('sha256').update(JSON.stringify(catalog)).digest('hex'), notes: 'Authorized source catalog import; CZK prices remain reference values.' } });
  let imported = 0, mediaCount = 0;
  for (const item of catalog) {
    const data = item.upgates_product || {};
    const product = await prisma.product.upsert({
      where: { sourceId: String(data.id || item.path) },
      update: { slug: slug(item.path), sku: data.code || undefined, manufacturer: data.manufacturer || null, taxRate: data.price?.vatRate ?? null, sourceUrl: item.source_url, sourceUpdatedAt: new Date(item.imported_at || Date.now()), status: ProductStatus.ACTIVE },
      create: { sourceId: String(data.id || item.path), slug: slug(item.path), sku: data.code || null, manufacturer: data.manufacturer || null, taxRate: data.price?.vatRate ?? null, sourceUrl: item.source_url, sourceUpdatedAt: new Date(item.imported_at || Date.now()), status: ProductStatus.ACTIVE },
    });
    await prisma.productTranslation.upsert({ where: { productId_locale: { productId: product.id, locale: 'CS' } }, update: { name: data.title || item.path, description: '', shortDescription: null }, create: { productId: product.id, locale: 'CS', name: data.title || item.path, description: '' } });
    const categoryName = data.category?.title || 'Other';
    const category = await prisma.category.upsert({ where: { slug: slug(categoryName) }, update: {}, create: { slug: slug(categoryName) } });
    await prisma.categoryTranslation.upsert({ where: { categoryId_locale: { categoryId: category.id, locale: 'CS' } }, update: { name: categoryName }, create: { categoryId: category.id, locale: 'CS', name: categoryName } });
    await prisma.productCategory.upsert({ where: { productId_categoryId: { productId: product.id, categoryId: category.id } }, update: {}, create: { productId: product.id, categoryId: category.id } });
    if (data.price?.withVat != null) await prisma.productPrice.create({ data: { productId: product.id, priceType: PriceType.RETAIL, currency: 'CZK', amountMinor: Math.round(Number(data.price.withVat) * 100), validFrom: new Date(item.imported_at || Date.now()) } });
    await prisma.inventory.upsert({ where: { productId: product.id }, update: { source: `source:${item.availability || 'unknown'}` }, create: { productId: product.id, quantity: 0, source: `source:${item.availability || 'unknown'}` } });
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    const media = item.images.map((url, index) => mediaBySource.get(url)).filter((m) => m?.local_path);
    if (media.length) { await prisma.productMedia.createMany({ data: media.map((m, index) => ({ productId: product.id, kind: MediaKind.IMAGE, url: `/${m.local_path.replace(/^public\//, '')}`, alt: data.title || null, sortOrder: index, licensed: true })) }); mediaCount += media.length; }
    await prisma.auditEvent.create({ data: { productId: product.id, actorId: 'system-import', action: AuditAction.IMPORT, payload: { sourceImportId: sourceImport.id, sourcePath: item.path, mediaCount: media.length } } });
    imported++;
  }
  console.log(JSON.stringify({ sourceImportId: sourceImport.id, imported, mediaCount, eurPricesCreated: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
