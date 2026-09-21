const { PrismaClient } = require('@prisma/client');
const fs = require('node:fs');
const prisma = new PrismaClient();
const content = JSON.parse(fs.readFileSync('docs/source-content.json', 'utf8'));
(async () => {
  let updated = 0;
  for (const item of content.products) {
    if (!item.description) continue;
    const product = await prisma.product.findFirst({ where: { sourceUrl: item.source_url } });
    if (!product) continue;
    await prisma.productTranslation.update({ where: { productId_locale: { productId: product.id, locale: 'CS' } }, data: { description: item.description, shortDescription: item.description } });
    updated++;
  }
  console.log(JSON.stringify({ updated, homepageDescription: Boolean(content.homepage.description) }));
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
