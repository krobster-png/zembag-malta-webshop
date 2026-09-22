const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const prices = { potato25: 34.90, potato5: 44.90, potato10: 64.90, onion2: 29.90, garlic075: 27.90, fruit2: 29.90, bread: 32.90, refillPotato: 4.90, refillOnion: 4.50, refillGarlic: 3.90 };
function priceFor(name, category) {
  const n = name.toLowerCase();
  if (category === 'Náplně') {
    if (n.includes('brambor')) return prices.refillPotato;
    if (n.includes('cibul')) return prices.refillOnion;
    if (n.includes('česnek')) return prices.refillGarlic;
    return null;
  }
  if (category === 'Na brambory') {
    if (n.includes('10 kg')) return prices.potato10;
    if (n.includes('5 kg')) return prices.potato5;
    if (n.includes('2,5 kg')) return prices.potato25;
  }
  if (category === 'Na cibuli' && n.includes('2 kg')) return prices.onion2;
  if (category === 'Na česnek' && n.includes('0,75 kg')) return prices.garlic075;
  if (category === 'Na ovoce a zeleninu' && n.includes('2 kg')) return prices.fruit2;
  if (category === 'Na chleba' && n.includes('chleba')) return prices.bread;
  return null;
}
(async () => {
  const products = await prisma.product.findMany({ include: { translations: { where: { locale: 'CS' } }, categories: { include: { category: { include: { translations: { where: { locale: 'CS' } } } } } } } });
  let assigned = 0, skipped = 0;
  for (const product of products) {
    const name = product.translations[0]?.name || '';
    const category = product.categories[0]?.category.translations[0]?.name || '';
    const amount = priceFor(name, category);
    if (amount == null) { skipped++; continue; }
    const existing = await prisma.productPrice.findFirst({ where: { productId: product.id, currency: 'EUR', priceType: 'RETAIL' }, orderBy: { validFrom: 'desc' } });
    const price = existing ? await prisma.productPrice.update({ where: { id: existing.id }, data: { amountMinor: Math.round(amount * 100), validFrom: new Date() } }) : await prisma.productPrice.create({ data: { productId: product.id, currency: 'EUR', priceType: 'RETAIL', amountMinor: Math.round(amount * 100), validFrom: new Date() } });
    await prisma.auditEvent.create({ data: { productId: product.id, actorId: 'joe-price-list-import', action: 'UPDATE', payload: { source: 'ZEMBAG_Malta_Retail_Price_List.pdf', vatPercent: 18, amount: price.amountMinor / 100, currency: 'EUR', matchedCategory: category } } });
    assigned++;
  }
  console.log(JSON.stringify({ assigned, skipped, vatPercent: 18 }));
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
