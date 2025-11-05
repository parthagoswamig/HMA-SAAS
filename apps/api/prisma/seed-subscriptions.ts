import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating subscription plans...');

  // Create default subscription plans
  const plans = [
    {
      name: 'FREE',
      displayName: 'Free Trial',
      description: 'Perfect for getting started',
      price: 0,
      billingCycle: 'monthly',
      userLimit: 5,
      patientLimit: 100,
      storageLimit: 5,
      appointmentLimit: 1000,
      features: [
        '30 days trial',
        'Up to 5 users',
        '100 patients',
        'Basic HMS features',
        'Email support',
        '5 GB storage'
      ],
      sortOrder: 1,
    },
    {
      name: 'BASIC',
      displayName: 'Basic Plan',
      description: 'For small clinics and practices',
      price: 99,
      billingCycle: 'monthly',
      userLimit: 20,
      patientLimit: 1000,
      storageLimit: 10,
      appointmentLimit: 2500,
      features: [
        'Up to 20 users',
        '1,000 patients',
        'Core HMS features',
        'Email & Chat support',
        '10 GB storage',
        'Basic reporting'
      ],
      sortOrder: 2,
    },
    {
      name: 'PROFESSIONAL',
      displayName: 'Professional Plan',
      description: 'For growing hospitals and clinics',
      price: 299,
      billingCycle: 'monthly',
      userLimit: 100,
      patientLimit: 10000,
      storageLimit: 100,
      appointmentLimit: 5000,
      features: [
        'Up to 100 users',
        '10,000 patients',
        'All advanced features',
        'Priority support',
        '100 GB storage',
        'Custom branding',
        'API access',
        'Advanced reporting',
        'Multi-location support'
      ],
      sortOrder: 3,
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      description: 'For large hospital networks',
      price: 999,
      billingCycle: 'monthly',
      userLimit: -1, // Unlimited
      patientLimit: -1, // Unlimited
      storageLimit: -1, // Unlimited
      appointmentLimit: -1, // Unlimited
      features: [
        'Unlimited users',
        'Unlimited patients',
        'All features included',
        '24/7 Dedicated support',
        'Unlimited storage',
        'Custom integrations',
        'SLA guarantee',
        'On-premise option',
        'White-label solution',
        'Advanced analytics',
        'Custom development'
      ],
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log('Subscription plans created successfully!');
  console.log(`Created ${plans.length} subscription plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
