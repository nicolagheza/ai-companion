import {redirect} from "next/navigation";
import {auth, redirectToSignIn} from "@clerk/nextjs/server";

import prismaDb from "@/lib/prismadb";
import {ChatClient} from "@/app/(chat)/(routes)/chat/[chatId]/components/client";

interface ChatIdPageProps {
    params: {
        chatId: string;
    }
}

const ChatPage = async ({params}: ChatIdPageProps) => {
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn()
    }

    const companion = await prismaDb.companion.findUnique({
        where: {
            id: params.chatId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                where: {
                    userId,
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })

    if (!companion) {
        return redirect("/");
    }
    return (
        <ChatClient companion={companion} />
    )
}

export default ChatPage;