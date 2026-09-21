import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";

const bodySchema = z.object({ productId: z.string().min(1), amount: z.number().finite().nonnegative(), actorId: z.string().email().optional() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid product ID or EUR amount", issues: parsed.error.flatten() }, { status: 400 });
  const { productId, amount, actorId = "admin@zembag.mt" } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const amountMinor = Math.round(amount * 100);
  const price = await prisma.productPrice.create({ data: { productId, priceType: "RETAIL", currency: "EUR", amountMinor, validFrom: new Date() } });
  await prisma.auditEvent.create({ data: { productId, actorId, action: "UPDATE", payload: { field: "malta_retail_price", currency: "EUR", amountMinor } } });
  revalidatePath("/"); revalidatePath("/admin");
  return NextResponse.json({ ok: true, price: { id: price.id, amount: amountMinor / 100, currency: "EUR" } });
}
