import { prismaClient } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await req.json();

    // Extract data from request body
    const {
      websiteUrl,
      topic,
      description,
      goal,
    } = body;

    // Validate required fields
    if (!description || !goal) {
      return NextResponse.json(
        { error: "Description and goal are required" },
        { status: 400 }
      );
    }

    // Insert data into keywords table
    const keywordRecord = await prismaClient.keywords.create({
      data: {
        userId,
        website_url: websiteUrl || null,
        seedKeyword: topic || null,
        description: description || null,
        goal: goal || null,
      },
    });

    // Get make.com webhook URL from environment variable
    const makeComWebhookUrl = "https://hook.eu2.make.com/7afh5k1xkl5sv305uwrgkvxdsqu1x6el";

    if (makeComWebhookUrl) {
      // Prepare form data for make.com API (form-urlencoded)
      const params = new URLSearchParams();
      params.append('id', keywordRecord.id);
      params.append('website_url', websiteUrl || '');
      params.append('topic', topic || '');
      params.append('description', description);
      params.append('goal', goal);
      
      // Fire-and-forget API call to make.com (don't await the response)
      axios.post(makeComWebhookUrl, params.toString(), {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        timeout: 5000 // 5 second timeout
      }).then(() => {
        console.log(`✅ Successfully sent keyword research request to make.com for id ${keywordRecord.id}`);
      }).catch((error) => {
        console.error(`❌ Make.com API call failed for keyword research ${keywordRecord.id}:`, error.message);
      });
    } else {
      console.warn('⚠️ MAKE_COM_KEYWORD_RESEARCH_WEBHOOK_URL not configured. Skipping make.com webhook call.');
    }

    return NextResponse.json({
      success: true,
      id: keywordRecord.id,
      message: "Keyword research request created successfully",
    });
  } catch (error) {
    console.error("Error creating keyword research:", error);
    return NextResponse.json(
      { error: "Failed to create keyword research request" },
      { status: 500 }
    );
  }
}
