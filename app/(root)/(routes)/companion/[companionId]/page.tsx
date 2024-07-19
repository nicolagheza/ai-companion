import prismaDb from "@/lib/prismadb";
import {CompanionForm} from "@/app/(root)/(routes)/companion/[companionId]/components/companion-form";

interface CompanionIdPageProps {
    params: {
        companionId: string;
    };
}

const CompanionIdPage = async ({params}: CompanionIdPageProps) => {
    // TODO: Check subscription

    const companion = await prismaDb.companion.findUnique({
        where: {
            id: params.companionId
        }
    });

    const categories = await prismaDb.category.findMany();

    return (
        <>
            <CompanionForm
                initialData={companion}
                categories={categories}
            />
        </>
    );
}

export default CompanionIdPage;