const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Connected! Users count:', users.length);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
