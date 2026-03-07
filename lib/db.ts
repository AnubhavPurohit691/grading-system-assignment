import {
  type PrismaClient,
  PrismaClient as PrismaClientClass,
} from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const createPrisma = (): PrismaClient => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClientClass({ adapter });
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  process.env.NODE_ENV === "production"
    ? createPrisma()
    : (globalForPrisma.prisma ??= createPrisma());
