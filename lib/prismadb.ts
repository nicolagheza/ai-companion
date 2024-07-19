import {PrismaClient} from "@prisma/client";

declare global {
    var prismaClient: PrismaClient | undefined;
}

const prismaDb = globalThis.prismaClient || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prismaClient = prismaDb;

export default prismaDb;