import { prismaClient } from "@/prisma/db";
import { NextResponse } from 'next/server';
import { sendTransactionalEmail } from "@/libs/loops";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log("🕑 Vercel cron job ran!");
  const now = new Date();

  // Find godmode articles directly with status = 0 and has content
  const readyArticles = await prismaClient.godmodeArticles.findMany({
    where: {
      status: 0,
      content: { not: null },
      articleType: 'godmode'
    },
    select: {
      id: true,
      batchId: true,
      userId: true,
      content: true
    },
    orderBy: {
      updatedAt: 'asc'
    }
  });

  console.log(`Found ${readyArticles.length} godmode articles with content ready to process`);

  if (readyArticles.length === 0) {
    return NextResponse.json({ ok: true, message: "No articles to process" });
  }

  // Group articles by batchId for batch-level operations
  type ArticleType = { id: string; batchId: string; userId: string; content: string | null };
  const articlesByBatch = new Map<string, ArticleType[]>();
  for (const article of readyArticles) {
    if (!articlesByBatch.has(article.batchId)) {
      articlesByBatch.set(article.batchId, []);
    }
    articlesByBatch.get(article.batchId)!.push(article);
  }

  // Process each batch
  for (const [batchId, articles] of Array.from(articlesByBatch.entries())) {
    console.log(`Processing batch ${batchId} with ${articles.length} ready articles`);

    // Get batch information
    const batch = await prismaClient.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      console.error(`Batch ${batchId} not found. Skipping.`);
      continue;
    }

    // Get user information
    const user = await prismaClient.user.findUnique({ 
      where: { id: articles[0].userId } 
    });

    if (!user || !user.email) {
      console.error(`User ID ${articles[0].userId} not found or has no email for batch ${batchId}. Skipping batch.`);
      continue;
    }

    // Update articles status to 1 (completed)
    await prismaClient.$transaction(async (tx) => {
      console.log(`Batch ${batchId}: Starting transaction to update ${articles.length} articles`);
      
      // Update godmode articles status to 1
      await tx.godmodeArticles.updateMany({
        where: {
          id: { in: articles.map((a: ArticleType) => a.id) },
          status: 0,
          content: { not: null }
        },
        data: { status: 1 },
      });
      console.log(`Batch ${batchId}: Updated ${articles.length} articles to status 1`);

      // Delete pending articles for these completed articles
      await tx.pendingGodmodeArticles.deleteMany({
        where: {
          batchId: batchId,
          godmodeArticleId: { in: articles.map((a: ArticleType) => a.id) }
        },
      });
      console.log(`Batch ${batchId}: Deleted pending articles`);

      // Check if all articles in the batch are now completed
      const totalArticlesInBatch = await tx.godmodeArticles.count({
        where: { batchId: batchId }
      });

      const completedArticlesInBatch = await tx.godmodeArticles.count({
        where: {
          batchId: batchId,
          status: 1
        }
      });

      // If all articles in batch are completed, update batch status
      if (completedArticlesInBatch === totalArticlesInBatch && batch.status === 0) {
        await tx.batch.update({
          where: { id: batchId },
          data: {
            status: 1,
            completed_articles: totalArticlesInBatch,
            pending_articles: 0,
            failed_articles: 0,
            updatedAt: now,
          },
        });
        console.log(`Batch ${batchId}: All articles completed. Batch status updated to 1`);
      } else {
        // Update batch with new completed count
        await tx.batch.update({
          where: { id: batchId },
          data: {
            completed_articles: completedArticlesInBatch,
            pending_articles: totalArticlesInBatch - completedArticlesInBatch,
            updatedAt: now,
          },
        });
        console.log(`Batch ${batchId}: Updated batch counts - Completed: ${completedArticlesInBatch}, Total: ${totalArticlesInBatch}`);
      }
    });

    // Send email notification
    if (user.email) {
      try {
        // Get updated batch info for email
        const updatedBatch = await prismaClient.batch.findUnique({
          where: { id: batchId }
        });

        if (updatedBatch) {
          await sendTransactionalEmail({
            transactionalId: "cmb2jl0ijc6ea430in4xiowyv",
            email: user.email,
            dataVariables: {
              text1: `Here is the status of godmode articles in batch ${batch.name}`,
              text2: `<table border="1" cellspacing="0" cellpadding="8" style="margin: 0 auto;">
              <thead>
               <tr>
                <th>Total Articles</th>
                <th>Completed Articles</th>
                <th>Pending Articles</th>
                <th>Failed Articles</th>
               </tr>
              </thead>
              <tbody>
               <tr>
                <td>${updatedBatch.articles}</td>
                <td>${updatedBatch.completed_articles}</td>
                <td>${updatedBatch.pending_articles}</td>
                <td>${updatedBatch.failed_articles}</td>
               </tr>
              </tbody>
              </table>`,
              subject: updatedBatch.status === 1 
                ? `Articles generated in ${batch.name} are now completed`
                : `Articles generated in ${batch.name} - Progress Update`,
              batch: batchId
            },
          });
          console.log(`Successfully sent email to ${user.email} for batch ${batchId}`);
        }
      } catch (error) {
        console.error(`Failed to send email to ${user.email} for batch ${batchId}:`, error);
      }
    }
  }

  return NextResponse.json({ ok: true, processed: readyArticles.length });
} 