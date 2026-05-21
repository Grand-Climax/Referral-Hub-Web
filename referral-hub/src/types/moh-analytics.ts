// MOH Analytics Types based on backend API responses

export interface MohDashboardSummary {
  total_referrals: number;
  total_accepted: number;
  total_rejected: number;
  total_admitted: number;
  acceptance_rate_percentage: number;
  average_ml_severity_score: number;
  average_turnaround_hours: number;
  success: boolean;
  message: string;
}

export interface DiseaseHotspot {
  region: string;
  department_name: string;
  referral_count: number;
  average_severity_score: number;
}

export interface DiseaseHotspotsResponse {
  data: DiseaseHotspot[];
  message: string;
  success: boolean;
}

export interface HospitalLoad {
  hospital_id: string;
  hospital_name: string;
  region: string;
  tier_level: string;
  total_referrals_received: number;
  total_accepted: number;
  total_rejected: number;
  rejection_rate_percentage: number;
  average_severity_score: number;
}

export interface HospitalLoadResponse {
  data: HospitalLoad[];
  message: string;
  success: boolean;
}

export interface ReferralTrend {
  period: string;
  total_referrals: number;
  accepted_referrals: number;
  rejected_referrals: number;
  emergency_referrals: number;
}

export interface ReferralTrendsResponse {
  data: ReferralTrend[];
  message: string;
  success: boolean;
}

export interface SeverityDistribution {
  region: string;
  total_referrals: number;
  critical_count: number;
  urgent_count: number;
  routine_count: number;
}

export interface SeverityDistributionResponse {
  data: SeverityDistribution[];
  message: string;
  success: boolean;
}

export interface ExportReportResponse {
  summary: MohDashboardSummary;
  hospital_load: HospitalLoad[];
  message: string;
  success: boolean;
}

// Query parameters for MOH endpoints
export interface MohQueryParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  region?: string;
  hospital_id?: string;
  tier_level?: string;
  granularity?: 'day' | 'week' | 'month';
}
