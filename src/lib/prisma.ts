import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Recalculate and update average rating for a workplace based on visible comments
 */
export async function recalculateWorkplaceRating(workplaceId: number) {
  const agg = await prisma.comment.aggregate({
    where: {
      workplaceId,
      show: true,
      rating: { gt: 0 },
    },
    _avg: {
      rating: true,
    },
  });

  const avgRating = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0;

  await prisma.workplace.update({
    where: { workplaceId },
    data: { rating: avgRating },
  });

  return avgRating;
}
