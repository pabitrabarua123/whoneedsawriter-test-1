import { prismaClient } from "@/prisma/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  console.log("🕑 Vercel cron job (job2) ran!");

  // Directly find godmode articles where content is filled and status = 0,
  // then update their status to 1.
  const result = await prismaClient.godmodeArticles.updateMany({
    where: {
      status: 0,
      content: {
        not: null,
      },
    },
    data: {
      status: 1,
    },
  });

  console.log(`Updated ${result.count} godmodeArticles to status = 1`);

  return NextResponse.json({ ok: true, updated: result.count });
}