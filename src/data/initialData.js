export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Alexander Wright',
    email: 'alexander@lincoz.internal',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Founder & Managing Director',
    department: 'Executive Governance',
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
    isMfaEnabled: false,
  },
  {
    id: 'usr-partner-1',
    name: 'David Vance',
    email: 'david@vanceweblabs.io',
    role: 'PARTNER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'External Systems Architect',
    organization: 'Vance Web Labs LLC',
    isMfaEnabled: true,
  },
  {
    id: 'usr-partner-2',
    name: 'Elena Rostova',
    email: 'elena@cloudsec.dev',
    role: 'PARTNER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Distributed Infrastructure Partner',
    organization: 'Rostova CyberTech Ltd',
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
        model: 'MILESTONE_TRANCHE_SHARE', // Gross Contract Share, Net Revenue Share, Milestone Tranche Share
        sharePercentage: 15.0, // 15% of discrete milestone tranche
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
    assignedTeamIds: ['usr-pm', 'usr-eng', 'usr-des', 'usr-partner-1', 'usr-partner-2'],
    milestones: [
      {
        id: 'ms-101',
        title: 'Milestone 1: Core Architecture & Security Audit',
        trancheAmount: 40000,
        status: 'COMPLETED', // PLANNING, IN_PROGRESS, IN_REVIEW, COMPLETED
        dueDate: '2026-09-10',
        billedAmount: 40000,
        isBilledToClient: true,
      },
      {
        id: 'ms-102',
        title: 'Milestone 2: High-Frequency Transaction Engine',
        trancheAmount: 50000,
        status: 'IN_PROGRESS',
        dueDate: '2026-10-30',
        billedAmount: 40000,
        isBilledToClient: true,
      },
      {
        id: 'ms-103',
        title: 'Milestone 3: Client Dashboard & Compliance Gateway',
        trancheAmount: 30000,
        status: 'PLANNING',
        dueDate: '2026-12-15',
        billedAmount: 0,
        isBilledToClient: false,
      }
    ]
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
    assignedTeamIds: ['usr-pm', 'usr-eng', 'usr-des', 'usr-partner-1'],
    milestones: [
      {
        id: 'ms-201',
        title: 'Milestone 1: WebRTC Video Room & HIPAA Encryption',
        trancheAmount: 35000,
        status: 'COMPLETED',
        dueDate: '2026-09-28',
        billedAmount: 35000,
        isBilledToClient: true,
      },
      {
        id: 'ms-202',
        title: 'Milestone 2: Doctor E-Prescription Gateway',
        trancheAmount: 30000,
        status: 'IN_PROGRESS',
        dueDate: '2026-10-31',
        billedAmount: 10000,
        isBilledToClient: true,
      },
      {
        id: 'ms-203',
        title: 'Milestone 3: Patient Portal & Mobile App Release',
        trancheAmount: 20000,
        status: 'PLANNING',
        dueDate: '2026-11-30',
        billedAmount: 0,
        isBilledToClient: false,
      }
    ]
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
    assignedTeamIds: ['usr-pm', 'usr-eng', 'usr-des'],
    milestones: [
      {
        id: 'ms-301',
        title: 'Milestone 1: Route Optimization ML Pipeline',
        trancheAmount: 35000,
        status: 'IN_PROGRESS',
        dueDate: '2026-11-15',
        billedAmount: 25000,
        isBilledToClient: true,
      },
      {
        id: 'ms-302',
        title: 'Milestone 2: Sensor Ingestion & Telemetry Dashboard',
        trancheAmount: 30000,
        status: 'PLANNING',
        dueDate: '2027-01-20',
        billedAmount: 0,
        isBilledToClient: false,
      }
    ]
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    milestoneId: 'ms-102',
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
    milestoneId: 'ms-102',
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
    milestoneId: 'ms-102',
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
    milestoneId: 'ms-103',
    title: 'Executive Financial Governance & 2-Step Payout Disbursement UI',
    description: 'Build the Super Admin interface for reviewing calculated partner payouts, validating milestone completion, and signing cryptographic disbursement authorizations.',
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
    milestoneId: 'ms-201',
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
    milestoneId: 'ms-202',
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
    milestoneId: 'ms-301',
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
    contractorName: 'David Vance (Vance Web Labs)',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    milestoneId: 'ms-101',
    milestoneTitle: 'Milestone 1: Core Architecture & Security Audit',
    agreementModel: 'MILESTONE_TRANCHE_SHARE',
    agreementPercentage: 15.0,
    milestoneBilledAmount: 40000,
    calculatedPayoutAmount: 6000, // 40000 * 0.15
    status: 'DISBURSED', // ACCRUING, INVOICED, APPROVED, DISBURSED
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-09-12T10:00:00.000Z',
    step2AuthorizedBy: 'usr-admin',
    step2AuthorizedAt: '2026-09-14T14:22:15.821Z',
    disbursementRef: 'WISE-TX-99824108',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Tranche 1 completed on time with zero security vulnerabilities.'
  },
  {
    id: 'payout-102',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance (Vance Web Labs)',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    milestoneId: 'ms-102',
    milestoneTitle: 'Milestone 2: High-Frequency Transaction Engine',
    agreementModel: 'MILESTONE_TRANCHE_SHARE',
    agreementPercentage: 15.0,
    milestoneBilledAmount: 40000,
    calculatedPayoutAmount: 6000,
    status: 'APPROVED', // Ready for Step 2 Super Admin Sign-off!
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-10-01T09:00:00.000Z',
    step2AuthorizedBy: null,
    step2AuthorizedAt: null,
    disbursementRef: '',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Task 2 submitted for review. Milestone partially billed to client ($40k of $50k).'
  },
  {
    id: 'payout-201',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance (Vance Web Labs)',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    milestoneId: 'ms-201',
    milestoneTitle: 'Milestone 1: WebRTC Video Room & HIPAA Encryption',
    agreementModel: 'GROSS_CONTRACT_SHARE',
    agreementPercentage: 12.5,
    milestoneBilledAmount: 35000,
    calculatedPayoutAmount: 4375, // 35000 * 0.125
    status: 'DISBURSED',
    step1ApprovedBy: 'usr-pm',
    step1ApprovedAt: '2026-09-29T11:00:00.000Z',
    step2AuthorizedBy: 'usr-admin',
    step2AuthorizedAt: '2026-09-30T16:40:11.192Z',
    disbursementRef: 'WISE-TX-44810294',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'HIPAA mesh fully verified.'
  },
  {
    id: 'payout-103',
    contractorId: 'usr-partner-2',
    contractorName: 'Elena Rostova (Rostova CyberTech)',
    projectId: 'proj-1',
    projectName: 'FinTech Quantum Ledger',
    milestoneId: 'ms-101',
    milestoneTitle: 'Milestone 1: Core Architecture & Security Audit',
    agreementModel: 'NET_REVENUE_SHARE',
    agreementPercentage: 20.0,
    milestoneBilledAmount: 40000,
    calculatedPayoutAmount: 6800, // (40000 - 6000 expense) * 0.20 = 34000 * 0.20 = 6800
    status: 'INVOICED', // Invoiced to client, awaiting PM & Admin review
    step1ApprovedBy: null,
    step1ApprovedAt: null,
    step2AuthorizedBy: null,
    step2AuthorizedAt: null,
    disbursementRef: '',
    disbursementChannel: 'USDC / Smart Contract Escrow',
    notes: 'Net share calculated after $6,000 HSM direct infrastructure cost deduction.'
  },
  {
    id: 'payout-202',
    contractorId: 'usr-partner-1',
    contractorName: 'David Vance (Vance Web Labs)',
    projectId: 'proj-2',
    projectName: 'PulseCare Telemedicine Suite',
    milestoneId: 'ms-202',
    milestoneTitle: 'Milestone 2: Doctor E-Prescription Gateway',
    agreementModel: 'GROSS_CONTRACT_SHARE',
    agreementPercentage: 12.5,
    milestoneBilledAmount: 10000,
    calculatedPayoutAmount: 1250,
    status: 'ACCRUING', // WIP
    step1ApprovedBy: null,
    step1ApprovedAt: null,
    step2AuthorizedBy: null,
    step2AuthorizedAt: null,
    disbursementRef: '',
    disbursementChannel: 'Wise Multi-Currency Wire',
    notes: 'Work in progress - accruing commission balance.'
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
    itemText: 'Approved Step 1 Milestone Calculation for David Vance ($6,000.00)',
    previousState: { status: 'INVOICED' },
    newState: { status: 'APPROVED' },
    clientIp: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0',
    timestamp: '2026-10-01T09:00:00.000Z'
  }
];
