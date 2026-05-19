// Persona metadata — safe to import in both client and server components
// Uses icon names from lucide-react (rendered by consumers, NOT emoji strings)
export const PERSONA_META: Record<string, { iconName: string; color: string; bg: string; borderColor: string; description: string }> = {
  'High Value': { iconName: 'Star',          color: '#92400e', bg: '#FEF3C7', borderColor: '#FDE68A', description: 'Top 20% by total spend' },
  'Loyal':      { iconName: 'Heart',         color: '#6D28D9', bg: '#EDE9FE', borderColor: '#C4B5FD', description: '3 or more purchases' },
  'New':        { iconName: 'UserPlus',      color: '#065F46', bg: '#D1FAE5', borderColor: '#6EE7B7', description: 'First order in last 30 days' },
  'At Risk':    { iconName: 'AlertTriangle', color: '#991B1B', bg: '#FEE2E2', borderColor: '#FECACA', description: 'No purchase in 90+ days' },
  'One-Time':   { iconName: 'UserMinus',     color: '#374151', bg: '#F3F4F6', borderColor: '#D1D5DB', description: 'Only one purchase ever' },
  'Prospect':   { iconName: 'User',          color: '#1D4ED8', bg: '#DBEAFE', borderColor: '#BFDBFE', description: 'Registered but no purchase yet' },
};

export const PERSONA_COLORS: Record<string, string> = {
  'High Value': 'bg-amber-100 text-amber-800',
  'Loyal':      'bg-purple-100 text-purple-800',
  'New':        'bg-green-100 text-green-700',
  'At Risk':    'bg-red-100 text-red-700',
  'One-Time':   'bg-gray-100 text-gray-700',
  'Prospect':   'bg-blue-100 text-blue-700',
};

// Map iconName → actual Lucide component (used in client components)
export { Star, Heart, UserPlus, AlertTriangle, UserMinus, User } from 'lucide-react';
import { Star, Heart, UserPlus, AlertTriangle, UserMinus, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const PERSONA_ICONS: Record<string, LucideIcon> = {
  'High Value': Star,
  'Loyal':      Heart,
  'New':        UserPlus,
  'At Risk':    AlertTriangle,
  'One-Time':   UserMinus,
  'Prospect':   User,
};
