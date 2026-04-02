import { ReferralLists } from "@/components/table/referral-lists";

const ReferralHistoryPage = () => {
  return (
    <div className="container mx-auto py-10">
      <ReferralLists getRowHref={(id) => `/receiving-specialist/${id}`} />
    </div>
  );
};

export default ReferralHistoryPage;
