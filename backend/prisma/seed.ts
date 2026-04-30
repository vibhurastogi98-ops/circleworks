import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (caution in production!)
  await prisma.userCompany.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@circleworks.com',
      hashedPassword: await bcrypt.hash('AdminPass123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
      hasCompletedTour: true,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'CircleWorks Demo',
      legalName: 'CircleWorks Demo Inc.',
      ein: '12-3456789',
      industry: 'Technology',
      companySize: '51-250',
      primaryState: 'CA',
      operatesInMultiState: true,
      states: ['CA', 'NY', 'TX'],
    },
  });

  console.log('✅ Created company:', company.name);

  // Link admin to company
  await prisma.userCompany.create({
    data: {
      userId: adminUser.id,
      companyId: company.id,
      role: 'admin',
      isActive: true,
    },
  });

  // Create sample employees
  const employeeData = [
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@circleworks.com',
      jobTitle: 'Engineering Manager',
      employmentType: 'FULL_TIME',
      payType: 'SALARY',
      payRate: 150000,
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael@circleworks.com',
      jobTitle: 'Senior Software Engineer',
      employmentType: 'FULL_TIME',
      payType: 'SALARY',
      payRate: 140000,
    },
    {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily@circleworks.com',
      jobTitle: 'Product Manager',
      employmentType: 'FULL_TIME',
      payType: 'SALARY',
      payRate: 130000,
    },
    {
      firstName: 'David',
      lastName: 'Kim',
      email: 'david@circleworks.com',
      jobTitle: 'Marketing Manager',
      employmentType: 'FULL_TIME',
      payType: 'SALARY',
      payRate: 95000,
    },
  ];

  for (const emp of employeeData) {
    await prisma.employee.create({
      data: {
        ...emp,
        companyId: company.id,
        hireDate: new Date('2023-01-15'),
        status: 'ACTIVE',
        payFrequency: 'BI_WEEKLY',
      },
    });
  }

  console.log(`✅ Created ${employeeData.length} sample employees`);

  // Create payroll schedule
  const nextPayDate = new Date();
  nextPayDate.setDate(nextPayDate.getDate() + 14);

  const payrollSchedule = await prisma.payrollSchedule.create({
    data: {
      companyId: company.id,
      name: 'Bi-Weekly (Every Other Friday)',
      frequency: 'BI_WEEKLY',
      nextRunDate: nextPayDate,
      isActive: true,
    },
  });

  console.log('✅ Created payroll schedule');

  // Create benefit plans
  const healthPlan = await prisma.benefitPlan.create({
    data: {
      companyId: company.id,
      name: 'Health Insurance (Blue Cross)',
      type: 'HEALTH',
      employerContribution: 500,
      employeeContribution: 150,
      isActive: true,
    },
  });

  const retirement401k = await prisma.benefitPlan.create({
    data: {
      companyId: company.id,
      name: '401(k) Retirement Plan',
      type: 'RETIREMENT',
      employerContribution: 0,
      employeeContribution: 0,
      isActive: true,
    },
  });

  console.log('✅ Created benefit plans');

  // Create sample payroll run
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);

  const payrollRun = await prisma.payrollRun.create({
    data: {
      companyId: company.id,
      periodStart: startDate,
      periodEnd: new Date(),
      payDate: new Date(nextPayDate),
      scheduleId: payrollSchedule.id,
      status: 'DRAFT',
    },
  });

  console.log('✅ Created sample payroll run');

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@circleworks.com',
      hashedPassword: await bcrypt.hash('TestPass123!', 10),
      firstName: 'Test',
      lastName: 'User',
      isEmailVerified: true,
      hasCompletedTour: false,
      role: 'EMPLOYEE',
    },
  });

  // Link test user to company
  await prisma.userCompany.create({
    data: {
      userId: testUser.id,
      companyId: company.id,
      role: 'employee',
      isActive: true,
    },
  });

  console.log('✅ Created test user');

  console.log('🎉 Database seeding complete!');
  console.log('\n📝 Test Credentials:');
  console.log('   Email: admin@circleworks.com');
  console.log('   Password: AdminPass123!');
  console.log('\n   Email: test@circleworks.com');
  console.log('   Password: TestPass123!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
