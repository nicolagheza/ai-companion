import prismaDb from "@/lib/prismadb";
import {SearchInput} from "@/components/search-input";
import {Categories} from "@/components/categories";
import {Companions} from "@/components/companions";

interface RootPageProps {
    searchParams: {
        categoryId: string;
        name: string;
    }
}

const RootPage = async ({
                            searchParams
                        }: RootPageProps) => {
    const data = await prismaDb.companion.findMany({
        where: {
            categoryId: searchParams.categoryId,
            name: {
                search: searchParams.name,
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })
    const categories = await prismaDb.category.findMany();
    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput/>
            <Categories data={categories}/>
            <Companions data={data} />
        </div>
    );
}

export default RootPage;