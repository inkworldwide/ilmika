const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const credentials = [
    { email: "admin@rentahouse.in", password: "admin123" },
    { email: "amit.sharma@gmail.com", password: "owner123" },
    { email: "vikram.singh@agent.com", password: "agent123" },
    { email: "arjun.das@gmail.com", password: "user123" },
    // Also fix the others just in case
    { email: "priya.patel@gmail.com", password: "owner123" },
    { email: "kavita.jain@agent.com", password: "agent123" }
  ];

  for (const cred of credentials) {
    const newHash = await bcrypt.hash(cred.password, 10);
    
    try {
      await prisma.user.update({
        where: { email: cred.email },
        data: {
          plainPassword: cred.password,
          passwordHash: newHash
        }
      });
      console.log(`Updated ${cred.email} back to ${cred.password}`);
    } catch (e) {
      console.log(`Could not update ${cred.email}: not found`);
    }
  }

  console.log('Done fixing demo credentials!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
