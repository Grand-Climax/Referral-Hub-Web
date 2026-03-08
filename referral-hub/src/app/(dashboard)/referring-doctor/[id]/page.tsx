import ReferralDetail from "@/components/referral/ReferralDetail";

    
interface ReferralDetailPageProps {
    params: {
        id: string;
    };
}

const ReferralDetailPage = async ({ params }: ReferralDetailPageProps) => {
    const { id } = await params;
    return (
        <div>
            <ReferralDetail id={id} />
        </div>
    );
};

export default ReferralDetailPage;