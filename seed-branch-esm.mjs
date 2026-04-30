import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const branch = await p.branch.upsert({
    where: { branch_id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      branch_id: '00000000-0000-0000-0000-000000000002',
      hospital_id: '00000000-0000-0000-0000-000000000001',
      name: 'Main Branch',
      location: 'Colombo',
      is_active: true,
    }
  });
  console.log('Branch upserted:', branch.name, branch.branch_id);
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
