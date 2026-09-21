import { PrismaClient } from "@prisma/client";

declare global { var zembagPrisma: PrismaClient | undefined; }
export const prisma = globalThis.zembagPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.zembagPrisma = prisma;
