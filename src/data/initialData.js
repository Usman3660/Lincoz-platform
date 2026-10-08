export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Alexander Wright',
    email: 'alexander@lincoz.internal',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Managing Director',
    department: 'Executive Governance',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 180000,
    isMfaEnabled: true,
  },
  {
    id: 'usr-pm',
    name: 'Sarah Jenkins',
    email: 'sarah.j@lincoz.internal',
    role: 'PROJECT_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Technical Project Manager',
    department: 'Operations',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 135000,
    isMfaEnabled: true,
  },
  {
    id: 'usr-eng',
    name: 'Alex Rivera',
    email: 'alex.r@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Full-Stack Engineer',
    department: 'Core Engineering',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 120000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-des',
    name: 'Maya Lin',
    email: 'maya.lin@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Product Designer',
    department: 'Design & UX',
    workMode: 'REMOTE',
    compensationType: 'SALARIED',
    salary: 110000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-sal-1',
    name: 'Liam Sterling',
    email: 'liam.s@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Backend Architect',
    department: 'Platform Systems',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 130000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-sal-2',
    name: 'Sophia Patel',
    email: 'sophia.p@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Lead DevOps & Cloud Engineer',
    department: 'Infrastructure & SRE',
    workMode: 'REMOTE',
    compensationType: 'SALARIED',
    salary: 125000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-sal-3',
    name: 'Marcus Hayes',
    email: 'marcus.h@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Mobile Engineer (iOS/Android)',
    department: 'Mobile Delivery',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 115000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-sal-4',
    name: 'Hannah Kim',
    email: 'hannah.k@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Senior QA Automation Engineer',
    department: 'Quality Assurance',
    workMode: 'REMOTE',
    compensationType: 'SALARIED',
    salary: 95000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-sal-5',
    name: 'Carlos Mendoza',
    email: 'carlos.m@lincoz.internal',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    title: 'Frontend & Design System Engineer',
    department: 'Core Engineering',
    workMode: 'ONSITE',
    compensationType: 'SALARIED',
    salary: 105000,
    isMfaEnabled: false,
  },
  {
    id: 'usr-partner-1',
    name: 'David Vance',
    email: 'david@vanceweblabs.io',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Systems Architect',
    department: 'Distributed SFU Systems',
    workMode: 'REMOTE',
    compensationType: 'PERCENTAGE',
    percentage: 15.0,
    isMfaEnabled: true,
  },
  {
    id: 'usr-partner-2',
    name: 'Elena Rostova',
    email: 'elena@cloudsec.dev',
    role: 'ONSITE_MEMBER',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: 'Cloud Infrastructure & HSM Engineer',
    department: 'Cryptographic Security',
    workMode: 'REMOTE',
    compensationType: 'PERCENTAGE',
    percentage: 20.0,
    isMfaEnabled: true,
  },
];

export const INITIAL_CONTRACTORS = [
  {
    userId: 'usr-partner-1',
    legalName: 'Vance Web Labs LLC',
    taxClassification: 'US-EIN (W-9 / Corp)',
    taxId: 'XX-XXX4920',
    country: 'United States',
    defaultPayoutChannel: 'Wise Multi-Currency Wire',
    payoutDetails: 'account_wise_usd_99214',
    agreements: [
      {
        projectId: 'proj-1',
        model: 'PROJECT_DIRECT_SHARE',
        sharePercentage: 15.0, // 15% of project contract value
        notes: '15% allocation for High-Frequency Engine and Cryptographic Modules',
        contractSignedDate: '2026-08-15',
      },
      {
        projectId: 'proj-2',
        model: 'GROSS_CONTRACT_SHARE',
        sharePercentage: 12.5, // 12.5% of total project invoice
        notes: 'Video WebRTC infrastructure consultation',
        contractSignedDate: '2026-09-01',
      }
    ]
  },
  {
    userId: 'usr-partner-2',
    legalName: 'Rostova CyberTech Ltd',
    taxClassification: 'EU-VAT (W-8BEN-E / Corporate)',
    taxId: 'EU-89102477B',
    country: 'Estonia / Remote',
    defaultPayoutChannel: 'USDC / Smart Contract Escrow',
    payoutDetails: '0x84A9215039E83bF8381A438A2d718471b6A82390',
    agreements: [
      {
        projectId: 'proj-1',
        model: 'NET_REVENUE_SHARE',
        sharePercentage: 20.0, // 20% after direct project expenses
        notes: '20% Net Share after AWS HSM Direct Hardware Expenses',
        contractSignedDate: '2026-08-20',
      }
    ]
  }
];

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'FinTech Quantum Ledger',
    clientName: 'Apex Global Banking Corp',
    clientContact: 'marcus.v@apexbanking.com',
    description: 'Ultra-secure hybrid distributed ledger and micro-settlement transaction engine.',
    totalContractValue: 120000,
    grossInvoiced: 80000,
    accountsReceivable: 35000,
    directExpenses: 6000,
    status: 'ACTIVE', // PLANNING, ACTIVE, IN_REVIEW, COMPLETED, ON_HOLD
    priority: 'Urgent',
    startDate: '2026-08-01',
    targetDeliveryDate: '2026-12-15',
    projectManagerId: 'usr-pm',
    assignedTeamIds: ['usr-pm', 'usr-eng', 'usr-des', 'usr-partner-1', 'usr-partner-2']
  },
  {
    id: 'proj-2',
    name: 'PulseCare Telemedicine Suite',
    clientName: 'MediHealth Systems',
    clientContact: 'claire@medihealth.org',
    description: 'HIPAA-compliant video consults, multi-provider scheduling, and real-time e-prescriptions.',
    totalContractValue: 85000,
    grossInvoiced: 45000,
    accountsReceivable: 20000,
    directExpenses: 4500,
    status: 'ACTIVE',
    priority: 'High',
    startDate: '2026-09-01',
    targetDeliveryDate: '2026-11-30',
    projectManagerId: 'usr-pm',
    assignedTeamIds: ['usr-pm', 'usr-eng', 'usr-des', 'usr-partner-1']
  },
  {
    id: 'proj-3',
    name: 'Nexus AI Logistics Hub',
    clientName: 'Omnilogix Freight Corp',
    clientContact: 'ops@omnilogix.net',
    description: 'Real-time route optimization engine with IoT warehouse sensor streaming.',
    totalContractValue: 65000,
    grossInvoiced: 25000,
    accountsReceivable: 15000,
    directExpenses: 2800,
    status: 'ACTIVE',
    priority: 'Medium',
    startDate: '2026-09-15',
    targetDeliveryDate: '2027-01-20',
    projectManagerId: 'usr-pm',
    assignedTeamIds: ['usr-pm', 'usr-eng', 'usr-des']
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Implement JWT & Argon2id Auth Session Revocation Engine',
    description: 'Implement salted Argon2id password verification, JWT token rotation, and Redis token blacklist revocation stream according to section 5.1.',
    priority: 'Urgent',
    status: 'COMPLETED', // BACKLOG, ASSIGNED, IN_PROGRESS, PENDING_REVIEW, COMPLETED
    isBlocked: false,
    blockReason: '',
    assigneeId: 'usr-eng',
    createdById: 'usr-pm',
    dueDate: '2026-10-05',
    estimatedHours: 18,
    checklists: [
      { id: 'chk-1', text: 'Argon2id hashing configuration with salt generation', isCompleted: true },
      { id: 'chk-2', text: 'Redis Token Revocation List (TRL) integration', isCompleted: true },
      { id: 'chk-3', text: 'MFA TOTP secret verification endpoint for Super Admin', isCompleted: true },
      { id: 'chk-4', text: 'Sub-250ms latency load test benchmarking', isCompleted: true },
    ],
    deliverables: [
      { type: 'GIT_PR', title: 'PR #142: Core Auth & Redis Revocation', url: 'https://github.com/lincoz/quantum-ledger/pull/142' },
      { type: 'DOC', title: 'MFA Security Architecture Spec', url: 'https://wiki.lincoz.internal/sec/mfa-v2' }
    ],
    comments: [
      {
        id: 'cm-1',
        userId: 'usr-pm',
        text: 'Ensure MFA is strictly enforced for Super Admin role logins before marking completed.',
        createdAt: '2026-10-01T08:30:00.000Z'
      },
      {
        id: 'cm-2',
        userId: 'usr-eng',
        text: 'All benchmark tests passed at 84ms p99 latency. PR is merged.',
        createdAt: '2026-10-01T11:45:00.000Z'
      }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'High-Frequency Matching Engine Microservice (Kafka + Rust/Node)',
    description: 'Deliver the core settlement worker listening to internal event queues and performing atomic micro-settlement ledger entries.',
    priority: 'Urgent',
    status: 'PENDING_REVIEW',
    isBlocked: false,
    blockReason: '',
    assigneeId: 'usr-partner-1', // David Vance (Freelancer)
    createdById: 'usr-pm',
    dueDate: '2026-10-12',
    estimatedHours: 35,
    checklists: [
      { id: 'chk-201', text: 'Kafka event consumer group implementation', isCompleted: true },
      { id: 'chk-202', text: 'Atomic ledger balance lock with PostgreSQL RLS', isCompleted: true },
      { id: 'chk-203', text: 'Reconciliation fallback handler for socket timeouts', isCompleted: true },
      { id: 'chk-204', text: 'End-to-end sandbox load simulation with 10k req/sec', isCompleted: false },
    ],
    deliverables: [
      { type: 'GIT_PR', title: 'PR #189: High-Frequency Worker & Kafka Consumer', url: 'https://github.com/lincoz/quantum-ledger/pull/189' },
      { type: 'DEMO', title: 'Staging Benchmarking Dashboard', url: 'https://bench.staging.quantumledger.dev' }
    ],
    comments: [
      {
        id: 'cm-201',
        userId: 'usr-partner-1',
        text: 'I have pushed PR #189 and connected the staging worker. 3 out of 4 checklist items tested and ready for PM review.',
        createdAt: '2026-10-01T12:00:00.000Z'
      }
    ]
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Append-Only Audit Log Trigger & JSON Delta Engine',
    description: 'Ensure immutable audit logs capture UUIDv4, actor ID, client IP, UTC timestamp down to milliseconds, and previous/new state JSON diffs.',
    priority: 'High',
    status: 'IN_PROGRESS',
    isBlocked: false,
    blockReason: '',
    assigneeId: 'usr-eng',
    createdById: 'usr-pm',
    dueDate: '2026-10-18',
    estimatedHours: 24,
    checklists: [
      { id: 'chk-301', text: 'PostgreSQL trigger preventing UPDATE or DELETE on task_audit_logs', isCompleted: true },
      { id: 'chk-302', text: 'JSONB delta calculator for state transitions', isCompleted: true },
      { id: 'chk-303', text: 'Asynchronous event dispatcher to avoid blocking task updates', isCompleted: false },
      { id: 'chk-304', text: 'User-facing activity feed UI component integration', isCompleted: false },
    ],
    deliverables: [],
    comments: []
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'Executive Financial Governance & 2-Step Payout Disbursement UI',
    description: 'Build the Super Admin interface for reviewing calculated partner payouts, validating deliverable completion, and signing cryptographic disbursement authorizations.',
    priority: 'High',
    status: 'IN_PROGRESS',
    isBlocked: false,
    blockReason: '',
    assigneeId: 'usr-des',
    createdById: 'usr-admin',
    dueDate: '2026-10-22',
    estimatedHours: 20,
    checklists: [
      { id: 'chk-401', text: 'Figma interactive component library design', isCompleted: true },
      { id: 'chk-402', text: '2-step modal flow with confirmation token dialog', isCompleted: true },
      { id: 'chk-403', text: 'Financial summary chart cards (TCV, Invoiced, AR, Liabilities)', isCompleted: true },
      { id: 'chk-404', text: 'Dark/Light theme contrast and glassmorphic polish', isCompleted: false },
    ],
    deliverables: [
      { type: 'FIGMA', title: 'Figma: Lincoz 2-Step Disbursement & Governance V2', url: 'https://figma.com/file/lincoz-disbursement-v2' }
    ],
    comments: []
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'HIPAA WebRTC End-to-End Encrypted Media Mesh',
    description: 'Configure multi-party secure video rooms with ephemeral cryptographic keys and automatic session audit logging.',
    priority: 'Urgent',
    status: 'COMPLETED',
    isBlocked: false,
    blockReason: '',
    assigneeId: 'usr-partner-1', // David Vance
    createdById: 'usr-pm',
    dueDate: '2026-09-25',
    estimatedHours: 40,
    checklists: [
      { id: 'chk-501', text: 'WebRTC SFU server setup on dedicated HIPAA cluster', isCompleted: true },
      { id: 'chk-502', text: 'DTLS-SRTP key exchange verification', isCompleted: true },
      { id: 'chk-503', text: 'Automatic call teardown on doctor disconnect', isCompleted: true },
    ],
    deliverables: [
      { type: 'GIT_PR', title: 'PR #88: WebRTC Encrypted Mesh Integration', url: 'https://github.com/lincoz/pulsecare/pull/88' }
    ],
    comments: []
  },
  {
    id: 'task-6',
    projectId: 'proj-2',
    title: 'Doctor E-Prescription FHIR Compliant API',
    description: 'Implement e-prescription digital signature pipeline adhering to standard healthcare FHIR specs.',
    priority: 'High',
    status: 'IN_PROGRESS',
    isBlocked: true,
    blockReason: 'Awaiting MediHealth partner pharmacy sandbox credentials from client IT',
    assigneeId: 'usr-eng',
    createdById: 'usr-pm',
    dueDate: '2026-10-25',
    estimatedHours: 28,
    checklists: [
      { id: 'chk-601', text: 'FHIR JSON schema validation engine', isCompleted: true },
      { id: 'chk-602', text: 'Doctor digital signature cryptographic verification', isCompleted: false },
      { id: 'chk-603', text: 'Direct pharmacy webhook callback dispatcher', isCompleted: false },
    ],
    deliverables: [],
    comments: [
      {
        id: 'cm-601',
        userId: 'usr-pm',
        text: 'Followed up with Marcus at MediHealth regarding sandbox keys. Expected tomorrow morning.',
        createdAt: '2026-10-01T09:15:00.000Z'
      }
    ]
  },
  {
    id: 'task-7',
    projectId: 'proj-3',
    title: 'Route Matrix Cost Optimizer (A* & Dijkstra Hybrid)',
    description: 'Develop graph clustering algorithm to batch deliveries across 45 logistics hubs.',
    priority: 'Medium',
    status: 'ASSIGNED',
    isBlocked: false,
    blockReason: '',
    assigneeId: 'usr-eng',
    createdById: 'usr-pm',
    dueDate: '2026-11-05',
    estimatedHours: 32,
    checklists: [
      { id: 'chk-701', text: 'OpenStreetMap geospatial tile caching', isCompleted: false },
      { id: 'chk-702', text: 'Real-time traffic latency penalty weights', isCompleted: false },
      { id: 'chk-703', text: 'Fleet fuel consumption simulation benchmarks', isCompleted: false },
    ],
    deliverables: [],
    comments: []
  }
];

export const INITIAL_PAYOUT_LEDGER = [
  {
    id: 'payout-101',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    deliverableTitle: 'Phase 1: Architecture & Security Deliverable',
    agreementModel: 'WHOLE_PROJECT_SHARE',
    agreementPercentage: 15.0,
    projectTotalValue: 120000,
    calculatedPayoutAmount: 6000, // Part of $18,000 total project share ($120k * 15%)
    totalProjectShare: 18000,
    status: 'DISBURSED', // ACCRUING, INVOICED, APPROVED, DISBURSED
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-09-12T10:00:00.000Z',
    step2AuthorizedBy: 'usr-admin',
    step2AuthorizedAt: '2026-09-14T14:22:15.821Z',
    disbursementRef: 'WISE-TX-99824108',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Phase 1 settlement from 15% Whole Project Share ($18,000 total).'
  },
  {
    id: 'payout-102',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    deliverableTitle: 'Phase 2: High-Frequency Transaction Engine',
    agreementModel: 'WHOLE_PROJECT_SHARE',
    agreementPercentage: 15.0,
    projectTotalValue: 120000,
    calculatedPayoutAmount: 6000,
    totalProjectShare: 18000,
    status: 'APPROVED', // Ready for Step 2 Super Admin Sign-off!
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-10-01T09:00:00.000Z',
    step2AuthorizedBy: null,
    step2AuthorizedAt: null,
    disbursementRef: '',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Phase 2 deliverable verified. Ready for Super Admin settlement recording.'
  },
  {
    id: 'payout-201',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    deliverableTitle: 'Phase 1: WebRTC Video Room & Encryption',
    agreementModel: 'WHOLE_PROJECT_SHARE',
    agreementPercentage: 12.5,
    projectTotalValue: 85000,
    calculatedPayoutAmount: 4375, // Part of $10,625 total project share ($85k * 12.5%)
    totalProjectShare: 10625,
    status: 'DISBURSED',
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-09-29T11:00:00.000Z',
    step2AuthorizedBy: 'usr-admin',
    step2AuthorizedAt: '2026-09-30T16:40:11.192Z',
    disbursementRef: 'WISE-TX-44810294',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Phase 1 settled from 12.5% Whole Project Share ($10,625 total).'
  },
  {
    id: 'payout-103',
    contractorId: 'usr-partner-2',
    contractorName: 'Elena Rostova',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    deliverableTitle: 'Cloud Security & HSM Integration',
    agreementModel: 'WHOLE_PROJECT_SHARE',
    agreementPercentage: 20.0,
    projectTotalValue: 120000,
    calculatedPayoutAmount: 12000, // Part of $24,000 total project share ($120k * 20%)
    totalProjectShare: 24000,
    status: 'APPROVED',
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-10-02T14:00:00.000Z',
    step2AuthorizedBy: null,
    step2AuthorizedAt: null,
    disbursementRef: '',
    disbursementChannel: 'Direct Wire Transfer',
    notes: 'Phase 1 approved from 20% Whole Project Share ($24,000 total).'
  },
  {
    id: 'payout-202',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    deliverableTitle: 'Phase 2: Doctor E-Prescription Gateway',
    agreementModel: 'WHOLE_PROJECT_SHARE',
    agreementPercentage: 12.5,
    projectTotalValue: 85000,
    calculatedPayoutAmount: 6250, // Remaining part of $10,625
    totalProjectShare: 10625,
    status: 'ACCRUING', // WIP
    step1ApprovedBy: null,
    step1ApprovedAt: null,
    step2AuthorizedBy: null,
    step2AuthorizedAt: null,
    disbursementRef: '',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Accruing remaining project share balance.'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'a8f192b4-e431-419a-9e12-84192b77a001',
    taskId: 'task-1',
    taskTitle: 'Implement JWT & Argon2id Auth Session Revocation Engine',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    actorId: 'usr-eng',
    actorName: 'Alex Rivera',
    actorRole: 'ONSITE_MEMBER',
    actionType: 'ITEM_CHECKED',
    itemText: 'Sub-250ms latency load test benchmarking',
    previousState: { isCompleted: false },
    newState: { isCompleted: true },
    clientIp: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0',
    timestamp: '2026-10-01T11:42:15.912Z'
  },
  {
    id: 'b7e291a3-d320-4089-8d01-73081a66b002',
    taskId: 'task-1',
    taskTitle: 'Implement JWT & Argon2id Auth Session Revocation Engine',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    actorId: 'usr-eng',
    actorName: 'Alex Rivera',
    actorRole: 'ONSITE_MEMBER',
    actionType: 'STATUS_CHANGED',
    itemText: 'Transitioned task to COMPLETED',
    previousState: { status: 'PENDING_REVIEW' },
    newState: { status: 'COMPLETED' },
    clientIp: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0',
    timestamp: '2026-10-01T11:45:00.231Z'
  },
  {
    id: 'c6d38092-c21f-4f78-7c90-62f70955c003',
    taskId: 'task-2',
    taskTitle: 'High-Frequency Matching Engine Microservice (Kafka + Rust/Node)',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    actorId: 'usr-partner-1',
    actorName: 'David Vance',
    actorRole: 'PARTNER',
    actionType: 'STATUS_CHANGED',
    itemText: 'Submitted for PM verification & Review',
    previousState: { status: 'IN_PROGRESS' },
    newState: { status: 'PENDING_REVIEW' },
    clientIp: '172.56.21.99',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
    timestamp: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'd5c47981-b10e-4e67-6b8f-51e6f844d004',
    taskId: 'task-2',
    taskTitle: 'High-Frequency Matching Engine Microservice (Kafka + Rust/Node)',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    actorId: 'usr-partner-1',
    actorName: 'David Vance',
    actorRole: 'PARTNER',
    actionType: 'ITEM_CHECKED',
    itemText: 'Reconciliation fallback handler for socket timeouts',
    previousState: { isCompleted: false },
    newState: { isCompleted: true },
    clientIp: '172.56.21.99',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
    timestamp: '2026-10-01T11:58:32.419Z'
  },
  {
    id: 'e4b56870-a0fd-4d56-5a7e-40d5e733e005',
    taskId: null,
    taskTitle: null,
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    actorId: 'usr-pm',
    actorName: 'Sarah Jenkins',
    actorRole: 'PROJECT_MANAGER',
    actionType: 'PAYOUT_VERIFIED',
    itemText: 'Approved Step 1 Deliverable Calculation for David Vance ($6,000.00)',
    previousState: { status: 'INVOICED' },
    newState: { status: 'APPROVED' },
    clientIp: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0',
    timestamp: '2026-10-01T09:00:00.000Z'
  }
];

export const INITIAL_CLIENTS_DIRECTORY = [
  {
    id: 'cli-1',
    category: 'CLIENT', // 'CLIENT' or 'FREELANCER'
    name: 'Apex Global Banking Corp',
    email: 'marcus.v@apexbanking.com',
    contactNumber: '+1 (415) 890-2100',
    country: 'United States',
    associatedProjects: ['proj-1'],
    notes: 'Enterprise Tier-1 financial institution client.',
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'cli-2',
    category: 'CLIENT',
    name: 'MediHealth Systems',
    email: 'procurement@medihealth.org',
    contactNumber: '+1 (617) 492-7711',
    country: 'United States',
    associatedProjects: ['proj-2'],
    notes: 'Digital healthcare & telemedicine client.',
    createdAt: '2026-08-15T11:30:00.000Z'
  },
  {
    id: 'cli-3',
    category: 'CLIENT',
    name: 'Aegis Cyber Defense Group',
    email: 'ops@aegiscyber.co.uk',
    contactNumber: '+44 20 7946 0912',
    country: 'United Kingdom',
    associatedProjects: ['proj-3'],
    notes: 'Cybersecurity identity vault contract.',
    createdAt: '2026-09-01T14:15:00.000Z'
  },
  {
    id: 'fl-1',
    category: 'FREELANCER',
    name: 'David Vance',
    email: 'david@vanceweblabs.io',
    contactNumber: '+1 (312) 555-0182',
    country: 'United States',
    percentage: 15.0, // Commission % that freelancer gets from project
    associatedProjects: ['proj-1', 'proj-2'],
    skills: 'WebRTC, Distributed SFU, High-Concurrency Rust',
    notes: 'Lead systems architect freelancer on Quantum Ledger Node.',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'fl-2',
    category: 'FREELANCER',
    name: 'Elena Rostova',
    email: 'elena@cloudsec.dev',
    contactNumber: '+372 612 3456',
    country: 'Estonia',
    percentage: 20.0,
    associatedProjects: ['proj-1'],
    skills: 'Cloud Security, AWS HSM, Micro-settlement',
    notes: 'Distributed infrastructure and HSM cryptographic security freelancer.',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'fl-3',
    category: 'FREELANCER',
    name: 'Kavita Patel',
    email: 'kavita.p@smartcontracts.in',
    contactNumber: '+91 98200 12345',
    country: 'India',
    percentage: 12.5,
    associatedProjects: ['proj-3'],
    skills: 'Solidity, ZK-Snarks, Smart Contract Audits',
    notes: 'Zero-knowledge proof verification freelancer.',
    createdAt: '2026-09-10T16:00:00.000Z'
  }
];

export const INITIAL_CLIENT_INVOICES = [
  {
    id: 'inv-101',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    clientName: 'Apex Global Banking Corp',
    invoiceNumber: 'INV-2026-081',
    amount: 50000,
    issueDate: '2026-08-10',
    dueDate: '2026-09-10',
    status: 'PAID',
    notes: 'Initial deposit & Phase 1 setup invoice'
  },
  {
    id: 'inv-102',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    clientName: 'Apex Global Banking Corp',
    invoiceNumber: 'INV-2026-094',
    amount: 30000,
    issueDate: '2026-09-15',
    dueDate: '2026-10-15',
    status: 'PENDING',
    notes: 'Phase 2 Architecture & Kafka Settlement Worker deliverable invoice'
  },
  {
    id: 'inv-103',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    clientName: 'Apex Global Banking Corp',
    invoiceNumber: 'INV-2026-102',
    amount: 40000,
    issueDate: '2026-10-02',
    dueDate: '2026-11-02',
    status: 'PAID',
    notes: 'Phase 3 HSM Cryptographic Engine & Production Deployment'
  },
  {
    id: 'inv-201',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    clientName: 'MediHealth Systems',
    invoiceNumber: 'INV-2026-088',
    amount: 45000,
    issueDate: '2026-09-05',
    dueDate: '2026-10-05',
    status: 'PARTIAL',
    notes: 'Telemedicine core engine & HIPAA portal provisioning invoice'
  },
  {
    id: 'inv-202',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    clientName: 'MediHealth Systems',
    invoiceNumber: 'INV-2026-105',
    amount: 25000,
    issueDate: '2026-10-04',
    dueDate: '2026-11-04',
    status: 'PENDING',
    notes: 'WebRTC SFU Video Milestone Billing'
  },
  {
    id: 'inv-301',
    projectId: 'proj-3',
    projectName: 'Nexus AI Logistics Hub',
    clientName: 'Omnilogix Freight Corp',
    invoiceNumber: 'INV-2026-098',
    amount: 25000,
    issueDate: '2026-09-20',
    dueDate: '2026-10-20',
    status: 'PENDING',
    notes: 'Route optimization & IoT sensor ingest setup invoice'
  },
  {
    id: 'inv-302',
    projectId: 'proj-3',
    projectName: 'Nexus AI Logistics Hub',
    clientName: 'Omnilogix Freight Corp',
    invoiceNumber: 'INV-2026-109',
    amount: 20000,
    issueDate: '2026-10-05',
    dueDate: '2026-11-05',
    status: 'PAID',
    notes: 'Real-time telemetry pipeline and dispatch optimizer invoice'
  }
];

export const INITIAL_CLIENT_PAYMENTS = [
  {
    id: 'payin-101',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    clientName: 'Apex Global Banking Corp',
    amount: 45000,
    paymentDate: '2026-08-25',
    paymentMethod: 'Bank Wire / Fedwire',
    referenceNumber: 'WIRE-APEX-88912',
    notes: 'Phase 1 invoice settlement'
  },
  {
    id: 'payin-102',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    clientName: 'Apex Global Banking Corp',
    amount: 40000,
    paymentDate: '2026-10-04',
    paymentMethod: 'Bank Wire / Fedwire',
    referenceNumber: 'WIRE-APEX-99410',
    notes: 'Phase 3 HSM invoice settlement'
  },
  {
    id: 'payin-201',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    clientName: 'MediHealth Systems',
    amount: 25000,
    paymentDate: '2026-09-18',
    paymentMethod: 'ACH Electronic Transfer',
    referenceNumber: 'ACH-MEDI-44102',
    notes: 'Partial payment on INV-2026-088'
  },
  {
    id: 'payin-301',
    projectId: 'proj-3',
    projectName: 'Nexus AI Logistics Hub',
    clientName: 'Omnilogix Freight Corp',
    amount: 10000,
    paymentDate: '2026-09-28',
    paymentMethod: 'Corporate Wire Transfer',
    referenceNumber: 'WIRE-OMNI-9021',
    notes: 'Advance deposit on Logistics Hub'
  },
  {
    id: 'payin-302',
    projectId: 'proj-3',
    projectName: 'Nexus AI Logistics Hub',
    clientName: 'Omnilogix Freight Corp',
    amount: 20000,
    paymentDate: '2026-10-05',
    paymentMethod: 'Corporate Wire Transfer',
    referenceNumber: 'WIRE-OMNI-9155',
    notes: 'Cleared invoice INV-2026-109 payment'
  }
];

export const INITIAL_SOURCE_PAYOUTS = [
  {
    id: 'src-101',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    sourceName: 'Nexus Lead Capital Ltd',
    amount: 5000,
    payoutDate: '2026-08-28',
    status: 'DISBURSED',
    paymentMethod: 'Wire Transfer',
    referenceNumber: 'SRC-FEE-1002',
    notes: '5% client acquisition & origination commission'
  },
  {
    id: 'src-201',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    sourceName: 'HealthTech Ventures Alliance',
    amount: 3500,
    payoutDate: '2026-09-22',
    status: 'DISBURSED',
    paymentMethod: 'ACH Transfer',
    referenceNumber: 'SRC-FEE-1005',
    notes: 'Client referral fee on signed Telemedicine contract'
  },
  {
    id: 'src-301',
    projectId: 'proj-3',
    projectName: 'Nexus AI Logistics Hub',
    sourceName: 'SupplyChain Growth Partners',
    amount: 2000,
    payoutDate: '2026-10-01',
    status: 'DISBURSED',
    paymentMethod: 'Bank Wire',
    referenceNumber: 'SRC-FEE-1008',
    notes: 'Origination fee for Freight Corp contract'
  }
];

export const INITIAL_DIRECT_EXPENSES = [
  {
    id: 'exp-101',
    month: '2026-08',
    category: 'Cloud Infrastructure & Security',
    vendor: 'AWS Cloud (CloudHSM & EC2 Ultra)',
    amount: 3800,
    expenseDate: '2026-08-20',
    receiptRef: 'AWS-INV-992140',
    status: 'PAID',
    notes: 'Dedicated CloudHSM cluster for cryptographic testbed'
  },
  {
    id: 'exp-102',
    month: '2026-09',
    category: 'API & Software Licenses',
    vendor: 'Confluent Kafka Cloud',
    amount: 2200,
    expenseDate: '2026-09-05',
    receiptRef: 'CONF-88192',
    status: 'PAID',
    notes: 'Managed Kafka streaming cluster throughput'
  },
  {
    id: 'exp-103',
    month: '2026-10',
    category: 'Cloud Infrastructure & Security',
    vendor: 'AWS Cloud Compute Cluster',
    amount: 3200,
    expenseDate: '2026-10-03',
    receiptRef: 'AWS-INV-998501',
    status: 'PAID',
    notes: 'High-availability ledger nodes and HSM cluster'
  },
  {
    id: 'exp-201',
    month: '2026-09',
    category: 'Cloud Infrastructure & Security',
    vendor: 'Twilio & LiveKit Cloud',
    amount: 2500,
    expenseDate: '2026-09-12',
    receiptRef: 'TW-77821',
    status: 'PAID',
    notes: 'HIPAA video streaming & SIP trunking credits'
  },
  {
    id: 'exp-202',
    month: '2026-09',
    category: 'Third-Party Compliance Audit',
    vendor: 'SecurHealth HIPAA Auditors',
    amount: 2000,
    expenseDate: '2026-09-25',
    receiptRef: 'HIPAA-AUD-2026',
    status: 'PAID',
    notes: 'Automated HIPAA compliance security assessment'
  },
  {
    id: 'exp-301',
    month: '2026-09',
    category: 'Cloud Infrastructure & Security',
    vendor: 'GCP BigQuery & IoT Core',
    amount: 2800,
    expenseDate: '2026-09-29',
    receiptRef: 'GCP-884109',
    status: 'PAID',
    notes: 'Real-time telemetry stream ingest and ML model training'
  },
  {
    id: 'exp-302',
    month: '2026-10',
    category: 'Server Hosting & Database Clusters',
    vendor: 'Supabase PostgreSQL Enterprise',
    amount: 1500,
    expenseDate: '2026-10-04',
    receiptRef: 'DB-SVR-88210',
    status: 'PAID',
    notes: 'Telemetry time-series database hosting'
  }
];

export const INITIAL_EXPENSE_CATEGORIES = [
  {
    id: 'exp-cat-1',
    name: 'Cloud Infrastructure & Security',
    description: 'AWS / GCP cloud compute, dedicated Kubernetes nodes, CloudHSM clusters, and encrypted VPC networks.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'exp-cat-2',
    name: 'API & Software Licenses',
    description: 'Third-party managed streaming, live messaging pipelines, Confluent Kafka, Stripe/Plaid, and Twilio WebRTC.',
    createdAt: '2026-08-10T09:30:00.000Z'
  },
  {
    id: 'exp-cat-3',
    name: 'Third-Party Compliance Audit',
    description: 'External cybersecurity penetration testing, HIPAA compliance verification, and SOC-2 security audit certifications.',
    createdAt: '2026-08-15T11:00:00.000Z'
  },
  {
    id: 'exp-cat-4',
    name: 'Server Hosting & Database Clusters',
    description: 'High-availability PostgreSQL/Redis clusters, staging environments, and high-frequency database replication nodes.',
    createdAt: '2026-09-01T14:15:00.000Z'
  },
  {
    id: 'exp-cat-5',
    name: 'Dev Tools & Testbeds',
    description: 'Automated CI/CD runners, distributed browser testing platforms (Cypress/Playwright Cloud), and developer licenses.',
    createdAt: '2026-09-12T16:45:00.000Z'
  }
];
