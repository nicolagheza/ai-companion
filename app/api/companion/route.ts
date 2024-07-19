import {NextResponse} from "next/server";
import {currentUser} from "@clerk/nextjs/server";

import prismaDb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { src, name, description, instructions, seed, categoryId } = body;

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // TODO: Check for subscription

        const companion = await prismaDb.companion.create({
            data: {
                categoryId,
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed
            }
        });

        return NextResponse.json(companion);
    } catch (error) {
        console.error("[COMPANION_POST]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}