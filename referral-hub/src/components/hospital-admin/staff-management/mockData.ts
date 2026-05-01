export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
  status: 'active' | 'inactive';
  avatar?: string;
  initials: string;
}

export const mockStaff: StaffMember[] = [
  {
    id: '#9942-CP',
    name: 'Dr. Sarah Chen',
    role: 'Specialist',
    department: 'Cardiology',
    permissions: ['Referrals', 'Records', '+2'],
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    initials: 'SC',
  },
  {
    id: '#8831-CP',
    name: 'Marcus Aris',
    role: 'Liaison Officer',
    department: 'Outpatient Services',
    permissions: ['Scheduling'],
    status: 'active',
    initials: 'MA',
  },
  {
    id: '#4401-CP',
    name: 'Dr. Julian Vane',
    role: 'Doctor',
    department: 'Neurology',
    permissions: ['Read-only Records'],
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?u=julian',
    initials: 'JV',
  },
  {
    id: '#2199-CP',
    name: 'Elena Ricci',
    role: 'Admin Staff',
    department: 'HR & Compliance',
    permissions: ['User Management', 'Audit'],
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    initials: 'ER',
  },
  {
    id: '#1022-CP',
    name: 'Benny Kingston',
    role: 'Nursing Admin',
    department: 'Pediatrics',
    permissions: ['Patient Flow'],
    status: 'active',
    initials: 'BK',
  },
  {
    id: '#1023-CP',
    name: 'Adam Smith',
    role: 'Doctor',
    department: 'Emergency',
    permissions: ['Referrals', 'Patient Flow'],
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=adam',
    initials: 'AS',
  },
  {
    id: '#1024-CP',
    name: 'Lisa Ray',
    role: 'Specialist',
    department: 'Radiology',
    permissions: ['Records'],
    status: 'inactive',
    initials: 'LR',
  },
];
