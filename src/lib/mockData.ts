export const mockOverviewData = {
  total_customers: 1248,
  active_customers: 842,
  upsell_ready_count: 156,
  average_streak_length: 12,
  notifications_sent_today: 342,
  campaign_completion_rate: 68,
  chartData: [
    { date: '1', notifications: 120 },
    { date: '2', notifications: 150 },
    { date: '3', notifications: 180 },
    { date: '4', notifications: 140 },
    { date: '5', notifications: 210 },
    { date: '6', notifications: 250 },
    { date: '7', notifications: 310 },
    { date: '8', notifications: 280 },
    { date: '9', notifications: 290 },
    { date: '10', notifications: 350 },
    { date: '11', notifications: 320 },
    { date: '12', notifications: 380 },
    { date: '13', notifications: 410 },
    { date: '14', notifications: 342 },
  ],
  stageDistribution: [
    { name: 'New', value: 240, fill: '#3b82f6' },
    { name: 'Active', value: 650, fill: '#10b981' },
    { name: 'At Risk', value: 180, fill: '#f59e0b' },
    { name: 'Lapsed', value: 178, fill: '#ef4444' },
  ]
};

export const mockCustomersList = {
  customers: [
    {
      id: 'uuid-1',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      email: 'sarah.j@example.com',
      lifecycle_stage: 'active',
      engagement_score: 85,
      has_active_campaign: true,
      last_purchase_date: '2026-05-10T14:30:00Z'
    },
    {
      id: 'uuid-2',
      first_name: 'Michael',
      last_name: 'Chen',
      email: 'mchen92@example.com',
      lifecycle_stage: 'new',
      engagement_score: 20,
      has_active_campaign: true,
      last_purchase_date: '2026-05-15T09:15:00Z'
    },
    {
      id: 'uuid-3',
      first_name: 'Emma',
      last_name: 'Watson',
      email: 'emma.w@example.com',
      lifecycle_stage: 'at_risk',
      engagement_score: 45,
      has_active_campaign: false,
      last_purchase_date: '2026-04-20T11:00:00Z'
    },
    {
      id: 'uuid-4',
      first_name: 'David',
      last_name: 'Kim',
      email: 'dkim@example.com',
      lifecycle_stage: 'lapsed',
      engagement_score: 10,
      has_active_campaign: false,
      last_purchase_date: '2026-02-10T16:45:00Z'
    },
    {
      id: 'uuid-5',
      first_name: 'Olivia',
      last_name: 'Rodriguez',
      email: 'olivia.r@example.com',
      lifecycle_stage: 'active',
      engagement_score: 95,
      has_active_campaign: true,
      last_purchase_date: '2026-05-12T08:30:00Z'
    }
  ],
  total: 5,
  page: 1,
  totalPages: 1
};

export const mockCustomerPersona = {
  customer: {
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 555 0123 456',
    whatsapp_opted_in: true
  },
  persona: {
    lifecycle_stage: 'active',
    engagement_score: 85,
    price_sensitivity: 'Medium',
    category_affinity: ['electronics', 'accessories', 'home_office'],
    product_affinity: {
      'prod-tech-101': { count: 3 },
      'prod-home-204': { count: 2 },
      'prod-acc-305': { count: 1 }
    }
  },
  purchases: [
    {
      id: 'pur-1',
      purchased_at: '2026-05-10T14:30:00Z',
      product_title: 'Wireless Noise-Cancelling Headphones',
      price: '249.99'
    },
    {
      id: 'pur-2',
      purchased_at: '2026-04-05T09:15:00Z',
      product_title: 'Ergonomic Office Chair',
      price: '199.00'
    },
    {
      id: 'pur-3',
      purchased_at: '2026-03-01T11:00:00Z',
      product_title: 'Mechanical Keyboard',
      price: '129.50'
    }
  ],
  currentStreak: 12,
  upsellReadiness: {
    ready: true,
    confidence: 'high'
  },
  campaigns: [
    {
      purchase_id: 'pur-1',
      jobs: [
        { id: 'j1', day_number: 1, status: 'sent' },
        { id: 'j2', day_number: 2, status: 'sent' },
        { id: 'j3', day_number: 3, status: 'sent' },
        { id: 'j4', day_number: 4, status: 'sent' },
        { id: 'j5', day_number: 5, status: 'sent' },
        { id: 'j6', day_number: 6, status: 'sent' },
        { id: 'j7', day_number: 7, status: 'pending' },
        { id: 'j8', day_number: 14, status: 'pending' },
        { id: 'j9', day_number: 21, status: 'pending' },
        { id: 'j10', day_number: 28, status: 'pending' }
      ]
    }
  ],
  notificationLog: [
    {
      id: 'log-1',
      type: 'daily_checkin',
      channel: 'whatsapp',
      scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'sent'
    },
    {
      id: 'log-2',
      type: 'daily_checkin',
      channel: 'whatsapp',
      scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      status: 'sent'
    },
    {
      id: 'log-3',
      type: 'milestone_celebration',
      channel: 'webpush',
      scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      status: 'sent'
    }
  ]
};

export const mockCampaigns = {
  stats: {
    active_campaigns: 842,
    paused_campaigns: 24,
    completed_this_month: 156
  },
  campaigns: [
    {
      purchase_id: 'camp-1',
      customer_id: 'uuid-1',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      product_title: 'Wireless Noise-Cancelling Headphones',
      paused_jobs: '0',
      completed_jobs: '6',
      total_jobs: '10',
      channel: 'whatsapp'
    },
    {
      purchase_id: 'camp-2',
      customer_id: 'uuid-2',
      first_name: 'Michael',
      last_name: 'Chen',
      product_title: 'Ergonomic Office Chair',
      paused_jobs: '0',
      completed_jobs: '2',
      total_jobs: '10',
      channel: 'webpush'
    },
    {
      purchase_id: 'camp-3',
      customer_id: 'uuid-3',
      first_name: 'Emma',
      last_name: 'Watson',
      product_title: '4K Ultra HD Monitor',
      paused_jobs: '8', 
      completed_jobs: '2',
      total_jobs: '10',
      channel: 'whatsapp'
    }
  ]
};
