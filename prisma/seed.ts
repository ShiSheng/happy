import { PrismaClient } from "@prisma/client";
import { defaultNewPetName } from "../src/lib/constants/petLevelPresentation";

/** 与 migrate deploy 一致优先直连：Vercel 上 DATABASE_URL 若为不可从构建环境访问的地址时，seed 仍可用 DIRECT_URL */
const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: { email: "demo@local" },
  });

  const petCount = await prisma.pet.count({ where: { userId: user.id } });
  if (petCount === 0) {
    await prisma.pet.create({
      data: {
        userId: user.id,
        name: defaultNewPetName(),
        xp: 200,
        coins: 50,
      },
    });
  }

  const ruleCount = await prisma.interactionRule.count();
  if (ruleCount === 0) {
    await prisma.interactionRule.createMany({
      data: [
        {
          polarity: "positive",
          name: "早起",
          xpDelta: 30,
          coinDelta: 5,
        },
        {
          polarity: "positive",
          name: "阅读 30 分钟",
          xpDelta: 20,
          coinDelta: 3,
        },
        {
          polarity: "positive",
          name: "运动",
          xpDelta: 25,
          coinDelta: 4,
        },
        {
          polarity: "negative",
          name: "熬夜",
          xpDelta: -15,
          coinDelta: -2,
        },
        {
          polarity: "negative",
          name: "拖延任务",
          xpDelta: -10,
          coinDelta: -1,
        },
      ],
    });
  }

  const giftCount = await prisma.gift.count();
  if (giftCount === 0) {
    await prisma.gift.createMany({
      data: [
        { name: "贴纸包", pointCost: 10 },
        { name: "小零食", pointCost: 25 },
        { name: "周末电影", pointCost: 60 },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
