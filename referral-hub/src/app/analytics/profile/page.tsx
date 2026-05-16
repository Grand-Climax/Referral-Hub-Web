import { DoctorProfile } from "@/components/doctor-profile/DoctorProfile";

export const metadata = {
  title: 'MOH Analyst Profile | Referral Hub',
  description: 'Ministry of Health Analyst profile and settings.',
};

export default function MohAnalystProfilePage() {
  return (
    <div>
      <DoctorProfile />
    </div>
  );
}
