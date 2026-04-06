import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminHash   = await bcrypt.hash('Admin1234!', 10);
  const analystHash = await bcrypt.hash('Analyst1234!', 10);
  const viewerHash  = await bcrypt.hash('Viewer1234!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.dev' },
    update: {},
    create: {
      email: 'admin@finance.dev',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finance.dev' },
    update: {},
    create: {
      email: 'analyst@finance.dev',
      passwordHash: analystHash,
      name: 'Analyst User',
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@finance.dev' },
    update: {},
    create: {
      email: 'viewer@finance.dev',
      passwordHash: viewerHash,
      name: 'Viewer User',
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  console.log(`✅  Users: ${admin.email}, ${analyst.email}, ${viewer.email}`);

  // ─── Financial Records ────────────────────────────────────────────────────
  // 30 records spread across the last 6 months
  const now = new Date();

  function daysAgo(n: number): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  }

  const records = [
    // Month 1 (most recent)
    { amount: 15000000n, type: 'INCOME'  as const, category: 'Salary',        date: daysAgo(5),   notes: 'Monthly salary — April' },
    { amount: 3500000n,  type: 'EXPENSE' as const, category: 'Rent',          date: daysAgo(6),   notes: 'Apartment rent — April' },
    { amount: 500000n,   type: 'EXPENSE' as const, category: 'Utilities',     date: daysAgo(7),   notes: 'Electricity and internet' },
    { amount: 250000n,   type: 'EXPENSE' as const, category: 'Food',          date: daysAgo(8),   notes: 'Grocery shopping' },
    { amount: 2000000n,  type: 'INCOME'  as const, category: 'Freelance',     date: daysAgo(10),  notes: 'Web dev contract — client A' },
    // Month 2
    { amount: 15000000n, type: 'INCOME'  as const, category: 'Salary',        date: daysAgo(35),  notes: 'Monthly salary — March' },
    { amount: 3500000n,  type: 'EXPENSE' as const, category: 'Rent',          date: daysAgo(36),  notes: 'Apartment rent — March' },
    { amount: 800000n,   type: 'EXPENSE' as const, category: 'Healthcare',    date: daysAgo(38),  notes: 'Doctor visit and medicines' },
    { amount: 350000n,   type: 'EXPENSE' as const, category: 'Transport',     date: daysAgo(40),  notes: 'Monthly metro pass' },
    { amount: 5000000n,  type: 'INCOME'  as const, category: 'Bonus',         date: daysAgo(42),  notes: 'Q1 performance bonus' },
    { amount: 450000n,   type: 'EXPENSE' as const, category: 'Entertainment', date: daysAgo(45),  notes: 'Streaming subscriptions' },
    // Month 3
    { amount: 15000000n, type: 'INCOME'  as const, category: 'Salary',        date: daysAgo(65),  notes: 'Monthly salary — February' },
    { amount: 3500000n,  type: 'EXPENSE' as const, category: 'Rent',          date: daysAgo(66),  notes: 'Apartment rent — February' },
    { amount: 1200000n,  type: 'INCOME'  as const, category: 'Freelance',     date: daysAgo(70),  notes: 'Logo design project' },
    { amount: 600000n,   type: 'EXPENSE' as const, category: 'Food',          date: daysAgo(72),  notes: 'Dining out this month' },
    { amount: 3000000n,  type: 'INCOME'  as const, category: 'Investment',    date: daysAgo(75),  notes: 'Dividend payout — mutual fund' },
    // Month 4
    { amount: 15000000n, type: 'INCOME'  as const, category: 'Salary',        date: daysAgo(95),  notes: 'Monthly salary — January' },
    { amount: 3500000n,  type: 'EXPENSE' as const, category: 'Rent',          date: daysAgo(96),  notes: 'Apartment rent — January' },
    { amount: 900000n,   type: 'EXPENSE' as const, category: 'Utilities',     date: daysAgo(100), notes: 'Winter electricity bill' },
    { amount: 1500000n,  type: 'EXPENSE' as const, category: 'Healthcare',    date: daysAgo(105), notes: 'Annual health checkup' },
    { amount: 700000n,   type: 'EXPENSE' as const, category: 'Transport',     date: daysAgo(108), notes: 'Car fuel — January' },
    { amount: 2500000n,  type: 'INCOME'  as const, category: 'Freelance',     date: daysAgo(110), notes: 'Monthly retainer — client B' },
    // Month 5
    { amount: 15000000n, type: 'INCOME'  as const, category: 'Salary',        date: daysAgo(125), notes: 'Monthly salary — December' },
    { amount: 3500000n,  type: 'EXPENSE' as const, category: 'Rent',          date: daysAgo(126), notes: 'Apartment rent — December' },
    { amount: 1800000n,  type: 'EXPENSE' as const, category: 'Entertainment', date: daysAgo(130), notes: 'Holiday gifts and travel' },
    { amount: 8000000n,  type: 'INCOME'  as const, category: 'Bonus',         date: daysAgo(132), notes: 'Year-end bonus' },
    { amount: 400000n,   type: 'EXPENSE' as const, category: 'Food',          date: daysAgo(135), notes: 'Holiday dinners' },
    // Month 6
    { amount: 15000000n, type: 'INCOME'  as const, category: 'Salary',        date: daysAgo(155), notes: 'Monthly salary — November' },
    { amount: 3500000n,  type: 'EXPENSE' as const, category: 'Rent',          date: daysAgo(156), notes: 'Apartment rent — November' },
    { amount: 4000000n,  type: 'INCOME'  as const, category: 'Investment',    date: daysAgo(160), notes: 'Stock sale — realised gain' },
  ];

  // Assign records round-robin between admin and analyst users
  const authors = [admin.id, analyst.id];
  for (let i = 0; i < records.length; i++) {
    await prisma.financialRecord.create({
      data: {
        ...records[i],
        createdBy: authors[i % 2],
      },
    });
  }

  console.log(`✅  ${records.length} financial records seeded`);
  console.log('\n🎉  Seed complete! Test credentials:');
  console.log('   admin@finance.dev    / Admin1234!');
  console.log('   analyst@finance.dev  / Analyst1234!');
  console.log('   viewer@finance.dev   / Viewer1234!');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
