const axios = require('axios');
const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const SupportNote = require('../models/SupportNote');
const UsageEvent = require('../models/UsageEvent');
const ChurnSignal = require('../models/ChurnSignal');
const Renewal = require('../models/Renewal');
const AIDraft = require('../models/AIDraft');
const AuditLog = require('../models/AuditLog');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct:free';

/**
 * Assembles structured context object from MongoDB for LLM consumption
 */
async function assembleCustomerContext(customerId) {
  const customer = await Customer.findById(customerId).populate('ownerId', 'name email');
  if (!customer) throw new Error('Customer not found');

  const subscriptions = await Subscription.find({ customerId })
    .populate('planId')
    .sort({ createdAt: -1 });

  const activeSub = subscriptions.find((s) => s.status === 'active' || s.status === 'past_due') || subscriptions[0];

  const recentNotes = await SupportNote.find({ customerId })
    .populate('agentId', 'name')
    .sort({ timestamp: -1 })
    .limit(10);

  const usageEvents = await UsageEvent.find({ customerId })
    .sort({ timestamp: -1 })
    .limit(30);

  const churnSignals = await ChurnSignal.find({ customerId })
    .sort({ firedAt: -1 });

  let renewal = null;
  if (activeSub) {
    renewal = await Renewal.findOne({ subscriptionId: activeSub._id });
  }

  // Calculate usage rollup
  const totalEvents = usageEvents.reduce((acc, ev) => acc + (ev.count || 1), 0);
  const eventBreakdown = {};
  usageEvents.forEach((ev) => {
    eventBreakdown[ev.eventType] = (eventBreakdown[ev.eventType] || 0) + (ev.count || 1);
  });

  return {
    customer: {
      id: customer._id.toString(),
      name: customer.name,
      industry: customer.industry,
      size: customer.size,
      lifecycleStage: customer.lifecycleStage,
      healthScore: customer.healthScore,
      owner: customer.ownerId ? customer.ownerId.name : 'Unassigned',
      contacts: customer.contacts,
      mrr: customer.mrr,
      arr: customer.arr,
    },
    subscription: activeSub
      ? {
          planName: activeSub.planId ? activeSub.planId.name : 'Standard Plan',
          planPrice: activeSub.currentMonthlyPrice,
          status: activeSub.status,
          startDate: activeSub.startDate,
          renewalDate: activeSub.renewalDate,
          changeHistory: activeSub.changeHistory,
        }
      : null,
    renewal: renewal
      ? {
          stage: renewal.stage,
          riskLevel: renewal.riskLevel,
          riskScore: renewal.riskScore,
          overrideRiskLevel: renewal.overrideRiskLevel,
        }
      : null,
    recentSupportNotes: recentNotes.map((n) => ({
      summary: n.summary,
      details: n.details,
      sentiment: n.sentiment,
      status: n.status,
      channel: n.channel,
      date: n.timestamp,
      agent: n.agentId ? n.agentId.name : 'Support Agent',
    })),
    usageSummary: {
      totalRecentEvents: totalEvents,
      breakdown: eventBreakdown,
    },
    churnSignals: churnSignals.map((s) => ({
      ruleCode: s.ruleCode,
      ruleName: s.ruleName,
      weight: s.weight,
      details: s.details,
      firedAt: s.firedAt,
    })),
  };
}

/**
 * Executes chat completion request to OpenRouter or uses intelligent fallback
 */
async function callOpenRouter(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_openrouter_api_key')) {
    console.log('OpenRouter API Key not provided; using intelligent local structured generator.');
    return null;
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SubscriptIQ Lifecycle Copilot',
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        content: response.data.choices[0].message.content.trim(),
        model: response.data.model || DEFAULT_MODEL,
      };
    }
  } catch (error) {
    console.error('OpenRouter API error:', error.response ? error.response.data : error.message);
    // Return null to trigger graceful fallback
    return null;
  }

  return null;
}

/**
 * 1. Account History Summarization
 */
async function generateAccountSummary(customerId, user) {
  const context = await assembleCustomerContext(customerId);

  const systemPrompt = `You are SubscriptIQ's AI Customer Success Copilot.
Your task is to generate a concise, factual, executive-level account summary for a Customer Success Manager (CSM) preparing for a call.
STRICT GUIDELINES:
1. Base your summary ONLY on the provided structured JSON context. Do not invent or hallucinate any facts.
2. Structure your output clearly:
   - Account Snapshot (Company, Plan, MRR, Health)
   - Usage & Engagement Trends
   - Recent Support & Relationship Health
   - Key Renewal & Churn Risk Signals
   - Recommended CSM Next Steps
3. Keep the tone professional, objective, and actionable.`;

  const userPrompt = `Here is the structured customer context:\n${JSON.stringify(context, null, 2)}\n\nGenerate the concise account briefing.`;

  const llmResult = await callOpenRouter(systemPrompt, userPrompt);
  let content = '';

  if (llmResult && llmResult.content) {
    content = llmResult.content;
  } else {
    // Intelligent grounded fallback
    const signalsList = context.churnSignals.length > 0 
      ? context.churnSignals.map(s => `• ${s.ruleName}: ${s.details}`).join('\n')
      : '• No active churn risk signals detected. Account health is steady.';

    const supportSummary = context.recentSupportNotes.length > 0
      ? `${context.recentSupportNotes.length} recent support interactions logged (${context.recentSupportNotes.filter(n => n.sentiment === 'negative').length} negative sentiment, ${context.recentSupportNotes.filter(n => n.status === 'open').length} open tickets).`
      : 'No recent open support tickets recorded.';

    content = `### Account Overview: ${context.customer.name}
**Tier & Value:** ${context.subscription ? context.subscription.planName : 'Standard'} ($${context.customer.mrr}/mo MRR | $${context.customer.arr}/yr ARR)
**Lifecycle Stage:** ${context.customer.lifecycleStage.toUpperCase()} (Health Score: ${context.customer.healthScore}/100)
**Account Owner:** ${context.customer.owner}

#### 1. Usage & Product Adoption
• Logged ${context.usageSummary.totalRecentEvents} total interaction events in recent tracking window.
• Core breakdown: ${Object.entries(context.usageSummary.breakdown).map(([k, v]) => `${k} (${v})`).join(', ') || 'Normal baseline usage'}.

#### 2. Support & Service Sentiment
• ${supportSummary}
${context.recentSupportNotes.slice(0, 2).map(n => `• [${n.sentiment.toUpperCase()}] ${n.summary} (${new Date(n.date).toLocaleDateString()})`).join('\n')}

#### 3. Churn Risk & Renewal Assessment
**Current Risk Level:** ${(context.renewal ? context.renewal.riskLevel : 'low').toUpperCase()}
**Renewal Date:** ${context.subscription ? new Date(context.subscription.renewalDate).toLocaleDateString() : 'N/A'}
${signalsList}

#### 4. CSM Action Plan
• Schedule 1-on-1 strategic alignment review with ${context.customer.contacts[0] ? context.customer.contacts[0].name : 'primary stakeholder'}.
• Address open support items and review feature adoption roadmap prior to renewal window.`;
  }

  // Store in AIDraft collection with status = pending_review
  const draft = await AIDraft.create({
    customerId,
    renewalId: context.renewal ? context.renewal.id : undefined,
    type: 'summary',
    title: `Account Summary: ${context.customer.name}`,
    content,
    originalPromptContext: { customerName: context.customer.name, riskLevel: context.renewal?.riskLevel },
    status: 'pending_review',
    modelUsed: llmResult ? llmResult.model : DEFAULT_MODEL,
    reviewedBy: user ? user._id : undefined,
  });

  if (user) {
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'AI_GENERATE_SUMMARY',
      entityType: 'AIDraft',
      entityId: draft._id,
      after: { type: 'summary', customerId, draftId: draft._id },
    });
  }

  return draft;
}

/**
 * 2. Churn-Signal Explanation (Grounded strictly in rule engine output)
 */
async function explainRenewalRisk(renewalId, user) {
  const renewal = await Renewal.findById(renewalId)
    .populate('customerId')
    .populate('subscriptionId')
    .populate('contributingSignals');

  if (!renewal) throw new Error('Renewal record not found');

  const customerId = renewal.customerId._id;
  const context = await assembleCustomerContext(customerId);

  const signals = renewal.contributingSignals || [];

  const systemPrompt = `You are SubscriptIQ's AI Customer Success Copilot.
Your task is to explain in plain, natural English *why* an account has been assigned its specific churn-risk level.
CRITICAL GUARDRAIL:
- You must STRICTLY ground your explanation in the contributing rules and signals provided below.
- Do NOT invent or assume additional hypothetical reasons (e.g. do not say "economic downturn" or "competitor pricing" unless explicit in the signals).
- Provide a clear, factual breakdown of each fired rule, its severity, and the overall impact on the upcoming renewal.`;

  const userPrompt = `Account: ${renewal.customerId.name}
Risk Level: ${renewal.riskLevel.toUpperCase()} (Calculated Score: ${renewal.riskScore})
Renewal Date: ${new Date(renewal.targetRenewalDate).toLocaleDateString()}

Contributing Signals from Rule Engine:
${signals.map((s, idx) => `${idx + 1}. [${s.weight.toUpperCase()} Priority] Rule: ${s.ruleName} -> Details: ${s.details}`).join('\n') || 'No specific negative signals fired.'}

Provide a transparent, human-readable executive explanation of why this risk score was generated.`;

  const llmResult = await callOpenRouter(systemPrompt, userPrompt);
  let content = '';

  if (llmResult && llmResult.content) {
    content = llmResult.content;
  } else {
    // Intelligent grounded fallback
    const signalDetails = signals.length > 0
      ? signals.map((s, idx) => `${idx + 1}. **${s.ruleName}** (${s.weight.toUpperCase()} weight): ${s.details}`).join('\n')
      : 'No critical risk flags fired. The account is within healthy retention thresholds.';

    content = `### Churn Risk Analysis: ${renewal.customerId.name}
**Calculated Risk Level:** ${renewal.riskLevel.toUpperCase()} (Risk Score: ${renewal.riskScore}/10)
**Target Renewal Date:** ${new Date(renewal.targetRenewalDate).toLocaleDateString()}

#### Why this risk flag fired:
The deterministic churn evaluation engine evaluated this account against active retention rules and detected the following ${signals.length} contributing signal(s):

${signalDetails}

#### Impact on Renewal:
${renewal.riskLevel === 'high' 
  ? 'This account requires immediate CSM intervention. The combination of dropped usage and/or support friction indicates a high probability of churn if not proactively managed before the renewal date.' 
  : renewal.riskLevel === 'medium'
  ? 'Moderate retention risk detected. While not in critical danger, key leading indicators show decreasing engagement or service friction that should be addressed promptly.'
  : 'Account health is strong with normal activity and no blocking risk signals.'}

#### Recommended Human Action:
Review open support tickets, schedule a stakeholder sync, and review the AI-drafted retention outreach before contacting the client.`;
  }

  const draft = await AIDraft.create({
    customerId,
    renewalId: renewal._id,
    type: 'risk_explanation',
    title: `Risk Explanation: ${renewal.customerId.name} (${renewal.riskLevel.toUpperCase()})`,
    content,
    originalPromptContext: { riskLevel: renewal.riskLevel, signalsCount: signals.length },
    status: 'pending_review',
    modelUsed: llmResult ? llmResult.model : DEFAULT_MODEL,
    reviewedBy: user ? user._id : undefined,
  });

  if (user) {
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'AI_EXPLAIN_RISK',
      entityType: 'AIDraft',
      entityId: draft._id,
      after: { renewalId, riskLevel: renewal.riskLevel },
    });
  }

  return draft;
}

/**
 * 3. Retention / Onboarding Outreach Message Drafting
 */
async function draftOutreachMessage(customerId, type = 'retention', user) {
  const context = await assembleCustomerContext(customerId);
  const primaryContact = (context.customer.contacts && context.customer.contacts[0]) || {
    name: 'Valued Partner',
    email: 'client@company.com',
  };

  const isRetention = type === 'retention';

  const systemPrompt = `You are SubscriptIQ's AI Customer Success Copilot.
Your task is to draft a personalized, empathetic, and professional first-pass email for a Customer Success Manager (CSM) to send to a client.
GUARDRAILS:
- This is a DRAFT for human review. It must end with a bracketed CSM signature placeholder.
- Do NOT make false promises or invent specific refund amounts.
- Ground the message in the customer's actual context: company name (${context.customer.name}), contact (${primaryContact.name}), current plan (${context.subscription?.planName || 'Platform'}), and relevant context (e.g. usage check-in or renewal prep).
- Tone: Helpful, proactive, collaborative, non-confrontational.`;

  const userPrompt = `Draft a ${isRetention ? 'Retention Outreach' : 'New Customer Onboarding Check-in'} message for:
Customer: ${context.customer.name}
Primary Contact: ${primaryContact.name} (${primaryContact.email})
Plan: ${context.subscription?.planName || 'Growth Plan'}
Renewal Date: ${context.subscription ? new Date(context.subscription.renewalDate).toLocaleDateString() : 'Upcoming'}
Current Risk Level: ${(context.renewal ? context.renewal.riskLevel : 'medium').toUpperCase()}
Fired Signals: ${context.churnSignals.map(s => s.ruleName).join(', ') || 'General check-in'}

Provide a ready-to-edit Subject line and Email Body.`;

  const llmResult = await callOpenRouter(systemPrompt, userPrompt);
  let content = '';

  if (llmResult && llmResult.content) {
    content = llmResult.content;
  } else {
    // Intelligent grounded fallback
    if (isRetention) {
      content = `Subject: Quick sync on your ${context.subscription?.planName || 'SubscriptIQ'} experience & upcoming renewal — ${context.customer.name}

Hi ${primaryContact.name.split(' ')[0] || 'there'},

I hope your week is going well! 

I'm reaching out as your dedicated Customer Success Manager for ${context.customer.name}. As we look ahead to your upcoming renewal on ${context.subscription ? new Date(context.subscription.renewalDate).toLocaleDateString() : 'the coming weeks'}, I wanted to check in directly and ensure you're getting maximum value from your ${context.subscription?.planName || 'subscription'}.

I noticed our team recently assisted with a few support items, and I want to personally verify that everything is running smoothly and that your team has all the resources you need.

Do you have 15 minutes this Thursday or Friday for a brief call to:
1. Review your current workflow and any feature questions
2. Ensure your team's goals for this quarter are on track
3. Preview upcoming platform enhancements tailored to your team

Let me know what time works best for you, or feel free to grab a slot on my calendar.

Best regards,

[Your Name / CSM Name]
Customer Success Team | SubscriptIQ`;
    } else {
      content = `Subject: Welcome to SubscriptIQ — Ensuring a great onboarding for ${context.customer.name}

Hi ${primaryContact.name.split(' ')[0] || 'there'},

Welcome aboard to SubscriptIQ! We're thrilled to partner with ${context.customer.name} on the ${context.subscription?.planName || 'Growth'} plan.

My name is [CSM Name], and I will be your primary point of contact to ensure your team's setup, data connections, and team onboarding go smoothly.

Here are 3 quick resources to get started:
• Getting Started Guide & Workspace Setup
• Inviting your team members and setting role permissions
• Scheduling your dedicated onboarding kickoff session

Could we schedule a 20-minute kickoff session this week to walk through your initial goals and answer any early questions?

Looking forward to working together!

Warm regards,

[Your Name / CSM Name]
Customer Success Team | SubscriptIQ`;
    }
  }

  const draft = await AIDraft.create({
    customerId,
    renewalId: context.renewal ? context.renewal.id : undefined,
    type: isRetention ? 'retention_message' : 'onboarding_message',
    title: `${isRetention ? 'Retention Outreach Draft' : 'Onboarding Draft'}: ${context.customer.name}`,
    content,
    originalPromptContext: { type, contactName: primaryContact.name, customerName: context.customer.name },
    status: 'pending_review',
    modelUsed: llmResult ? llmResult.model : DEFAULT_MODEL,
    reviewedBy: user ? user._id : undefined,
  });

  if (user) {
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'AI_DRAFT_MESSAGE',
      entityType: 'AIDraft',
      entityId: draft._id,
      after: { type: draft.type, customerId },
    });
  }

  return draft;
}

module.exports = {
  assembleCustomerContext,
  generateAccountSummary,
  explainRenewalRisk,
  draftOutreachMessage,
  DEFAULT_MODEL,
};
