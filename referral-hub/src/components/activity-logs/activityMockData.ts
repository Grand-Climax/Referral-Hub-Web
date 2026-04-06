export interface ActivityLog {
  id: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
    initials: string;
  };
  action: string;
  target: string;
  category: 'referral' | 'staff' | 'security' | 'system';
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
}

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'ACT-001',
    user: {
      name: 'Dr. Sarah Jenkins',
      role: 'Hospital Admin',
      initials: 'SJ',
    },
    action: 'Created a new referral',
    target: 'Patient John Doe (REF-2024-001)',
    category: 'referral',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
  },
  {
    id: 'ACT-002',
    user: {
      name: 'Michael Chen',
      role: 'IT Specialist',
      initials: 'MC',
    },
    action: 'Updated system permissions',
    target: 'Department: Cardiology',
    category: 'security',
    status: 'warning',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'ACT-003',
    user: {
      name: 'Elena Ricci',
      role: 'Admin Staff',
      initials: 'ER',
      avatar: 'https://i.pravatar.cc/150?u=elena',
    },
    action: 'Added new staff member',
    target: 'Adam Smith (ID: #1023-CP)',
    category: 'staff',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'ACT-004',
    user: {
      name: 'System',
      role: 'Automated Task',
      initials: 'SY',
    },
    action: 'Database backup completed',
    target: 'Primary Server (ADD-01)',
    category: 'system',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
  },
  {
    id: 'ACT-005',
    user: {
      name: 'Dr. Alice Smith',
      role: 'Referring Doctor',
      initials: 'AS',
    },
    action: 'Failed login attempt',
    target: 'User Account: asmith@hospital.org',
    category: 'security',
    status: 'failure',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
  },
  {
    id: 'ACT-006',
    user: {
      name: 'Benny Kingston',
      role: 'Nursing Admin',
      initials: 'BK',
    },
    action: 'Updated referral status',
    target: 'Jane Smith (REF-2024-002)',
    category: 'referral',
    status: 'success',
    timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), // 1.5 days ago
  },
  {
    id: 'ACT-007',
    user: {
      name: 'Dr. Sarah Jenkins',
      role: 'Hospital Admin',
      initials: 'SJ',
    },
    action: 'Exported audit log',
    target: 'Monthly Report - February 2024',
    category: 'system',
    status: 'success',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
];
