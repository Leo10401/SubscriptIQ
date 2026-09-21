const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Customer = require('./models/Customer');
const Subscription = require('./models/Subscription');
const Renewal = require('./models/Renewal');
const UsageEvent = require('./models/UsageEvent');
const SupportNote = require('./models/SupportNote');
const ChurnRule = require('./models/ChurnRule');
const ChurnSignal = require('./models/ChurnSignal');
const AIDraft = require('./models/AIDraft');
const AuditLog = require('./models/AuditLog');
const { evaluateSubscriptionChurn } = require('./services/churnEngine');

async function seedDatabase() {
  console.log('--- Starting SubscriptIQ Seed Process ---');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Plan.deleteMany({}),
    Customer.deleteMany({}),
    Subscription.deleteMany({}),
    Renewal.deleteMany({}),
    UsageEvent.deleteMany({}),
    SupportNote.deleteMany({}),
    ChurnRule.deleteMany({}),
    ChurnSignal.deleteMany({}),
    AIDraft.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Ayush Sharma',
    email: 'admin@subscriptiq.io',
    passwordHash,
    role: 'Admin',
    department: 'Leadership & Ops',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const csm = await User.create({
    name: 'Sarah Connor',
    email: 'sarah@subscriptiq.io',
    passwordHash,
    role: 'CSM',
    department: 'Customer Success',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  });

  const support = await User.create({
    name: 'Dave Miller',
    email: 'dave@subscriptiq.io',
    passwordHash,
    role: 'Support',
    department: 'Technical Support',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });

  const analyst = await User.create({
    name: 'Maya Patel',
    email: 'maya@subscriptiq.io',
    passwordHash,
    role: 'Analyst',
    department: 'Revenue Operations',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  });

  console.log('✓ Created 4 Demo Users (Admin, CSM, Support, Analyst)');

  // 3. Create Churn Rules
  const churnRules = await ChurnRule.insertMany([
    {
      code: 'RULE_USAGE_DROP',
      name: 'Usage Drop (>40%)',
      description: 'Product usage events dropped by more than 40% compared to previous 30-day window.',
      signalType: 'usage_drop',
      threshold: { dropPercent: 40 },
      weight: 'high',
      points: 4,
      isActive: true,
    },
    {
      code: 'RULE_UNRESOLVED_SUPPORT',
      name: 'Multiple Open Support Tickets',
      description: 'Customer has 2 or more unresolved support tickets in the last 30 days.',
      signalType: 'unresolved_support',
      threshold: { openTicketsCount: 2 },
      weight: 'medium',
      points: 3,
      isActive: true,
    },
    {
      code: 'RULE_NEGATIVE_SENTIMENT',
      name: 'Negative Sentiment in Support Note',
      description: 'Recent support interaction tagged with negative customer sentiment in the last 14 days.',
      signalType: 'negative_sentiment',
      threshold: { days: 14 },
      weight: 'medium',
      points: 2,
      isActive: true,
    },
    {
      code: 'RULE_PAYMENT_ISSUE',
      name: 'Past Due Payment Status',
      description: 'Subscription billing status marked as past_due due to failed payment or delinquent invoice.',
      signalType: 'payment_issue',
      threshold: {},
      weight: 'high',
      points: 4,
      isActive: true,
    },
    {
      code: 'RULE_PLAN_DOWNGRADE',
      name: 'Recent Plan Downgrade',
      description: 'Customer downgraded plan tier within the last 60 days.',
      signalType: 'plan_downgrade',
      threshold: { days: 60 },
      weight: 'medium',
      points: 2,
      isActive: true,
    },
    {
      code: 'RULE_LOW_ENGAGEMENT_PRE_RENEWAL',
      name: 'Low Pre-Renewal Engagement',
      description: 'Under 5 user logins within 30 days of upcoming renewal date.',
      signalType: 'low_engagement_pre_renewal',
      threshold: { minLogins: 5, daysBeforeRenewal: 30 },
      weight: 'high',
      points: 4,
      isActive: true,
    },
    {
      code: 'RULE_NO_CSM_CONTACT',
      name: 'Stale CSM Relationship (>45 days)',
      description: 'No customer success or support touchpoints logged in over 45 days.',
      signalType: 'no_csm_contact',
      threshold: { daysWithoutContact: 45 },
      weight: 'low',
      points: 1,
      isActive: true,
    },
  ]);

  console.log('✓ Created 7 Churn Rules');

  // 4. Create Plans
  const starterPlan = await Plan.create({
    name: 'Starter Plan',
    tier: 'Starter',
    price: 49,
    billingInterval: 'monthly',
    description: 'Essential customer management tools for early-stage teams.',
    entitlements: { customReports: false, aiCopilot: false, dedicatedCSM: false, sso: false },
    usageLimits: { seats: 3, apiCalls: 5000, storageGB: 10, integrations: 2 },
    version: 1,
  });

  const growthPlan = await Plan.create({
    name: 'Growth Plan',
    tier: 'Growth',
    price: 199,
    billingInterval: 'monthly',
    description: 'Advanced lifecycle automation and rule-based churn alerts.',
    entitlements: { customReports: true, aiCopilot: true, dedicatedCSM: false, sso: false },
    usageLimits: { seats: 10, apiCalls: 50000, storageGB: 50, integrations: 5 },
    version: 1,
  });

  const proPlan = await Plan.create({
    name: 'Professional Plan',
    tier: 'Professional',
    price: 499,
    billingInterval: 'monthly',
    description: 'Complete retention intelligence with AI Copilot and integrations.',
    entitlements: { customReports: true, aiCopilot: true, dedicatedCSM: true, sso: true },
    usageLimits: { seats: 25, apiCalls: 200000, storageGB: 200, integrations: 15 },
    version: 1,
  });

  const enterprisePlan = await Plan.create({
    name: 'Enterprise Plan',
    tier: 'Enterprise',
    price: 1299,
    billingInterval: 'annual',
    description: 'Custom security, unlimited bandwidth, and white-glove onboarding.',
    entitlements: { customReports: true, aiCopilot: true, dedicatedCSM: true, sso: true, customSLA: true },
    usageLimits: { seats: 100, apiCalls: 1000000, storageGB: 1000, integrations: 50 },
    version: 1,
  });

  console.log('✓ Created 4 Subscription Plans');

  // 5. Create Customers
  const customerData = [
    {
      name: 'Acme Cloud Dynamics',
      industry: 'Cloud Infrastructure',
      size: '201-500',
      ownerId: csm._id,
      lifecycleStage: 'active',
      website: 'https://acmecloud.example.com',
      mrr: 1299,
      arr: 15588,
      healthScore: 92,
      contacts: [{ name: 'Rachel Zane', email: 'rzane@acmecloud.example.com', phone: '+1-555-0101', role: 'VP Operations' }],
      plan: enterprisePlan,
      renewalOffsetDays: 75,
      isHighRisk: false,
    },
    {
      name: 'Nexus AI Systems',
      industry: 'Artificial Intelligence',
      size: '51-200',
      ownerId: csm._id,
      lifecycleStage: 'at_risk',
      website: 'https://nexusai.example.com',
      mrr: 499,
      arr: 5988,
      healthScore: 42,
      contacts: [{ name: 'Alex Vance', email: 'alex@nexusai.example.com', phone: '+1-555-0102', role: 'CTO' }],
      plan: proPlan,
      renewalOffsetDays: 14,
      isHighRisk: true, // Will have usage drop + open tickets
    },
    {
      name: 'Pulse Health Technologies',
      industry: 'Healthcare',
      size: '51-200',
      ownerId: csm._id,
      lifecycleStage: 'at_risk',
      website: 'https://pulsehealth.example.com',
      mrr: 499,
      arr: 5988,
      healthScore: 35,
      contacts: [{ name: 'Dr. Marcus Webb', email: 'mwebb@pulsehealth.example.com', phone: '+1-555-0103', role: 'Director of Tech' }],
      plan: proPlan,
      renewalOffsetDays: 20,
      isPastDue: true, // Will have past due + negative note
      isHighRisk: true,
    },
    {
      name: 'FinTech Horizon Labs',
      industry: 'Financial Services',
      size: '11-50',
      ownerId: csm._id,
      lifecycleStage: 'active',
      website: 'https://fintechhorizon.example.com',
      mrr: 199,
      arr: 2388,
      healthScore: 58,
      contacts: [{ name: 'Elena Rostova', email: 'elena@fintechhorizon.example.com', phone: '+1-555-0104', role: 'Head of Product' }],
      plan: growthPlan,
      renewalOffsetDays: 12, // Low engagement pre renewal
      isLowEngagement: true,
    },
    {
      name: 'CyberShield Global',
      industry: 'Cybersecurity',
      size: '500+',
      ownerId: admin._id,
      lifecycleStage: 'active',
      website: 'https://cybershield.example.com',
      mrr: 499,
      arr: 5988,
      healthScore: 68,
      contacts: [{ name: 'David Croft', email: 'dcroft@cybershield.example.com', phone: '+1-555-0105', role: 'Security Ops Lead' }],
      plan: proPlan,
      renewalOffsetDays: 45,
      isDowngraded: true,
    },
    {
      name: 'RetailMax Omnichannel',
      industry: 'E-commerce',
      size: '51-200',
      ownerId: csm._id,
      lifecycleStage: 'active',
      website: 'https://retailmax.example.com',
      mrr: 199,
      arr: 2388,
      healthScore: 88,
      contacts: [{ name: 'Liam Davies', email: 'liam@retailmax.example.com', phone: '+1-555-0106', role: 'E-commerce Director' }],
      plan: growthPlan,
      renewalOffsetDays: 60,
    },
    {
      name: 'Dataview Analytics',
      industry: 'Data & Analytics',
      size: '11-50',
      ownerId: csm._id,
      lifecycleStage: 'active',
      website: 'https://dataview.example.com',
      mrr: 199,
      arr: 2388,
      healthScore: 82,
      contacts: [{ name: 'Sophia Chen', email: 'sophia@dataview.example.com', phone: '+1-555-0107', role: 'Lead Architect' }],
      plan: growthPlan,
      renewalOffsetDays: 18,
      customStage: 'contacted',
    },
    {
      name: 'Quantum Robotics',
      industry: 'Robotics',
      size: '201-500',
      ownerId: csm._id,
      lifecycleStage: 'active',
      website: 'https://quantumrobotics.example.com',
      mrr: 1299,
      arr: 15588,
      healthScore: 96,
      contacts: [{ name: 'Gregory House', email: 'ghouse@quantumrobotics.example.com', phone: '+1-555-0108', role: 'Head of Engineering' }],
      plan: enterprisePlan,
      renewalOffsetDays: 330,
      customStage: 'renewed',
    },
    {
      name: 'CloudScale IO',
      industry: 'DevOps & Tooling',
      size: '1-10',
      ownerId: csm._id,
      lifecycleStage: 'churned',
      website: 'https://cloudscale.example.com',
      mrr: 0,
      arr: 0,
      healthScore: 10,
      contacts: [{ name: 'Tom Hardy', email: 'tom@cloudscale.example.com', phone: '+1-555-0109', role: 'Founder' }],
      plan: starterPlan,
      renewalOffsetDays: -15,
      isCanceled: true,
      customStage: 'churned',
    },
    {
      name: 'Bolt Logistics Network',
      industry: 'Logistics & Supply Chain',
      size: '51-200',
      ownerId: csm._id,
      lifecycleStage: 'active',
      website: 'https://boltlogistics.example.com',
      mrr: 199,
      arr: 2388,
      healthScore: 78,
      contacts: [{ name: 'Nina Simone', email: 'nina@boltlogistics.example.com', phone: '+1-555-0110', role: 'Logistics Manager' }],
      plan: growthPlan,
      renewalOffsetDays: 85,
    },
  ];

  const now = new Date();

  for (const cData of customerData) {
    const customer = await Customer.create({
      name: cData.name,
      industry: cData.industry,
      size: cData.size,
      ownerId: cData.ownerId,
      lifecycleStage: cData.lifecycleStage,
      website: cData.website,
      mrr: cData.mrr,
      arr: cData.arr,
      healthScore: cData.healthScore,
      contacts: cData.contacts,
    });

    const renewalDate = new Date(now.getTime() + cData.renewalOffsetDays * 24 * 60 * 60 * 1000);
    const startDate = new Date(now.getTime() - 280 * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      customerId: customer._id,
      planId: cData.plan._id,
      planVersion: 1,
      status: cData.isPastDue ? 'past_due' : cData.isCanceled ? 'canceled' : 'active',
      startDate,
      renewalDate,
      currentSeats: cData.plan.usageLimits.seats,
      currentMonthlyPrice: cData.plan.price,
      changeHistory: cData.isDowngraded
        ? [
            {
              fromPlanId: enterprisePlan._id,
              toPlanId: proPlan._id,
              date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
              type: 'downgrade',
              reason: 'Budget optimization during Q2 review',
            },
          ]
        : [],
    });

    // Seed usage events
    const eventCount = cData.isHighRisk ? 2 : cData.isLowEngagement ? 1 : 25;
    for (let i = 0; i < eventCount; i++) {
      const daysAgo = Math.floor(Math.random() * 25);
      await UsageEvent.create({
        customerId: customer._id,
        eventType: ['login', 'api_call', 'feature_used', 'export'][i % 4],
        count: Math.floor(Math.random() * 15) + 1,
        timestamp: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        metadata: { client: 'web', ip: '192.168.1.1' },
      });
    }

    // Historical usage events (30-60 days ago) for usage drop comparison
    if (cData.isHighRisk) {
      for (let i = 0; i < 20; i++) {
        const daysAgo = 35 + Math.floor(Math.random() * 20);
        await UsageEvent.create({
          customerId: customer._id,
          eventType: 'api_call',
          count: 50,
          timestamp: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Seed support notes
    if (cData.isHighRisk) {
      await SupportNote.create({
        customerId: customer._id,
        agentId: support._id,
        summary: 'API latency spikes causing export timeouts in production',
        details: 'Client reported critical timeout errors when running nightly automated bulk exports.',
        channel: 'ticket',
        sentiment: 'negative',
        status: 'open',
        severity: 'high',
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      });

      await SupportNote.create({
        customerId: customer._id,
        agentId: support._id,
        summary: 'Billing discrepancies reported on seat count invoice',
        details: 'Client contested 2 additional seats added by former employee.',
        channel: 'email',
        sentiment: 'negative',
        status: 'open',
        severity: 'medium',
        timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      });
    } else {
      await SupportNote.create({
        customerId: customer._id,
        agentId: support._id,
        summary: 'Assisted team with SSO configuration and Okta SAML mapping',
        details: 'Configured SAML metadata successfully. Verified admin login.',
        channel: 'chat',
        sentiment: 'positive',
        status: 'resolved',
        severity: 'low',
        timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      });
    }

    // Run churn evaluation for this subscription
    const evalResult = await evaluateSubscriptionChurn(subscription._id);

    // Apply custom stage if specified (e.g. 'contacted', 'renewed', 'churned')
    if (cData.customStage && evalResult) {
      await Renewal.findByIdAndUpdate(evalResult.renewalId, {
        stage: cData.customStage,
      });
    }
  }

  console.log('✓ Created 10 Customers with Subscriptions, Usage Events, Support Notes & Churn Evaluations');

  // 6. Create sample AI Drafts
  const nexus = await Customer.findOne({ name: 'Nexus AI Systems' });
  if (nexus) {
    const renewal = await Renewal.findOne({ customerId: nexus._id });
    await AIDraft.create({
      customerId: nexus._id,
      renewalId: renewal ? renewal._id : undefined,
      type: 'retention_message',
      title: 'Retention Outreach Draft: Nexus AI Systems',
      content: `Subject: Priority review on your SubscriptIQ experience & upcoming renewal

Hi Alex,

I hope you're having a productive week.

I'm reaching out as your dedicated Customer Success Manager. With Nexus AI's Professional subscription renewing on ${renewal ? new Date(renewal.targetRenewalDate).toLocaleDateString() : 'the coming weeks'}, I wanted to make sure we connect directly.

I noticed our engineering team is actively resolving the export latency ticket you raised. I've personally escalated this to our platform lead to ensure it's resolved swiftly.

Could we schedule a 15-minute executive sync this Thursday to review your technical goals and discuss our upcoming v2 throughput enhancements?

Best regards,

Sarah Connor
Customer Success Manager | SubscriptIQ`,
      status: 'pending_review',
      modelUsed: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    });
  }

  console.log('✓ Created Sample AI Drafts in Inbox');
  console.log('--- SubscriptIQ Seed Process Completed Successfully ---');
}

module.exports = { seedDatabase };

// If run directly from command line
if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/subscriptiq';
  mongoose
    .connect(uri)
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

