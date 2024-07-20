import {Redis} from "@upstash/redis";
import {OpenAIEmbeddings} from "@langchain/openai";
import {Pinecone} from "@pinecone-database/pinecone";
import {PineconeStore} from "@langchain/pinecone";

export type CompanionKey = {
    companionName: string;
    modelName: string;
    userId: string;
}

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private vectorDbClient: Pinecone | undefined;

    public constructor() {
        this.history = Redis.fromEnv();
        this.vectorDbClient = undefined;
    }

    public init() {
        this.vectorDbClient = new Pinecone({apiKey: process.env.PINECONE_API_KEY!});
    }

    public async vectorSearch(
        recentChatHistoy: string,
        companionFileName: string,
    ) {
        const pineconeClient = <Pinecone>this.vectorDbClient;

        const pineconeIndex: any = pineconeClient.Index(
            process.env.PINECONE_INDEX || "",
        )
        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({openAIApiKey: process.env.PINECONE_API_KEY!}),
            {pineconeIndex}
        )

        return await vectorStore
            .similaritySearch(recentChatHistoy, 3, {fileName: companionFileName})
            .catch((err) => {
                console.error("Failed to get vector search results", err);
            })
    }

    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
            MemoryManager.instance.init();
        }

        return MemoryManager.instance;
    }

    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

    public async writeToHistory(text: string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey.userId === "undefined") {
            console.log("Companion key set incorrectly");
            return "";
        }

        const key = this.generateRedisCompanionKey(companionKey);
        const result = await this.history.zadd(key, {
            score: Date.now(),
            member: text,
        });

        return result;
    }

    public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
        if (!companionKey || typeof companionKey.userId === "undefined") {
            console.log("Companion key set incorrectly");
            return "";
        }
        const key = this.generateRedisCompanionKey(companionKey);
        let result = await this.history.zrange(key, 0, Date.now(), {
            byScore: true,
        });

        result = result.slice(-30).reverse();
        // return recent chats
        return result.reverse().join("\n");
    }

    public async seedChatHistory(
        seedContent: string,
        delimiter: string = "\n",
        companionKey: CompanionKey
    ) {
        const key = this.generateRedisCompanionKey(companionKey);

        if (await this.history.exists(key)) {
            console.log("User already has chat history");
            return;
        }

        const content = seedContent.split(delimiter);

        let counter = 0;
        for (const line of content) {
            await this.history.zadd(key, { score: counter, member: line });
            counter++;
        }
    }
}