import {ReplicateStream, StreamingTextResponse} from "ai";
import {currentUser} from "@clerk/nextjs/server";
import Replicate from 'replicate';
import {NextResponse} from "next/server";

import {MemoryManager} from "@/lib/memory";
import {rateLimit} from "@/lib/rate-limit";
import prismaDb from "@/lib/prismadb";

export async function POST(
    req: Request,
    {params}: { params: { chatId: string } }
) {
    try {
        const {prompt} = await req.json();
        const user = await currentUser();
        if (!user || !user.firstName || !user.id) {
            return new NextResponse('Unauthorized', {status: 401});
        }

        const identifier = req.url + '-' + user.id;
        const {success} = await rateLimit(identifier);
        if (!success) {
            return new NextResponse('Rate limit exceeded', {status: 429});
        }

        const companion = await prismaDb.companion.update({
            where: {
                id: params.chatId,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: 'user',
                        userId: user.id,
                    },
                },
            },
        });

        if (!companion) {
            return new NextResponse('Companion not found', {status: 404});
        }

        const name = companion.id;
        const companion_file_name = name + '.txt';

        const companionKey = {
            companionName: name!,
            userId: user.id,
            modelName: 'llama2-13b',
        };
        const memoryManager = await MemoryManager.getInstance();
        const records = await memoryManager.readLatestHistory(companionKey);
        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, '\n\n', companionKey);
        }
        await memoryManager.writeToHistory('User: ' + prompt + '\n', companionKey);

        const recentChatHistory = await memoryManager.readLatestHistory(
            companionKey
        );
        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            companion_file_name
        );

        let relevantHistory = '';
        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join('\n');
        }
/*
        const {handlers} = LangChainStream();
        const model = new Replicate({
            model: 'a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
            input: {
                max_length: 2040,
            },
            apiKey: process.env.REPLICATE_API_TOKEN,
            callbacks: CallbackManager.fromHandlers(handlers)
        })

        model.verbose = true;
        const resp = String(await model.invoke(`
          ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 
  
          ${companion.instructions}
  
          Below are relevant details about ${companion.name}'s past and the conversation you are in.
          ${relevantHistory}
  
  
          ${recentChatHistory}\n${companion.name}:`
        ).catch(console.error));
        const cleaned = resp.replaceAll(',', '');
        const chunks = cleaned.split('\n');
        const response = chunks[0];
*/
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
        const response = await replicate.predictions.create({
            stream: true,
            model: "meta/llama-2-70b-chat",
            input: {
                prompt: `
                  ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 
          
                  ${companion.instructions}
          
                  Below are relevant details about ${companion.name}'s past and the conversation you are in.
                  ${relevantHistory}
          
          
                  ${recentChatHistory}\n${companion.name}:`
            }
        })

        const stream = await ReplicateStream(response, {
            onCompletion: async (completion: string) => {
                await memoryManager.writeToHistory('' + completion.trim(), companionKey);
                await prismaDb.companion.update({
                    where: {
                        id: params.chatId,
                    },
                    data: {
                        messages: {
                            create: {
                                content: completion.trim(),
                                role: 'system',
                                userId: user.id,
                            },
                        },
                    },
                });
            }
        });

        return new StreamingTextResponse(stream);
    } catch (error) {
        return new NextResponse('Internal Error', {status: 500});
    }
}
