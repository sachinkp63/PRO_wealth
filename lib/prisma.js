import {PrismaClient} from '@prisma/client'
import { eachDayOfInterval } from 'date-fns';
import { Young_Serif } from 'next/font/google';
import { connection } from 'next/server';

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production"){
    globalThis.prisma = db;
}


//globalThis.prisma: this is global variable ensures that the Prisma Client instance is reuesd across hot reloads during DEVELOPMENT. Without this, each time
//your applicartion
//reloads, a new instance of the Prisma Client would be created, potentially leading to connection issues 