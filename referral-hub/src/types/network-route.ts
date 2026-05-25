export const NETWORK_ROUTE_REFERRAL_TYPES = [
  "INPATIENT",
  "OUTPATIENT",
  "EMERGENCY",
] as const;

export type NetworkRouteReferralType =
  (typeof NETWORK_ROUTE_REFERRAL_TYPES)[number];

export interface NetworkRoute {
  id: string;
  sender_hospital_id: string;
  receiver_hospital_id: string;
  referral_type: string;
  requires_admin_approval: boolean;
}

export interface CreateNetworkRouteRequest {
  sender_hospital_id: string;
  receiver_hospital_id: string;
  referral_type: string;
  requires_admin_approval: boolean;
}

export interface NetworkRoutesResponse {
  data?: NetworkRoute[];
  success?: boolean;
  message?: string;
}
