export type LiaisonReference = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export interface LiaisonDashboardStatItem {
  count: number;
  change: number;
}

export interface LiaisonDashboardStats {
  total_referrals: LiaisonDashboardStatItem;
  pending_review: LiaisonDashboardStatItem;
  approved_today: LiaisonDashboardStatItem;
  rejected: LiaisonDashboardStatItem;
}

export interface LiaisonDashboardStatsResponse {
  success: boolean;
  data: LiaisonDashboardStats;
}

export interface LiaisonReviewChecklist {
  attachments_included: boolean;
  clinical_history_attached: boolean;
  patient_identity_verified: boolean;
  vitals_included: boolean;
}

