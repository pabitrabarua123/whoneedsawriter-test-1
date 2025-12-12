import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    const { toneChoice, perspective, description } = await req.json();

    // Update user profile fields
    const updatedUser = await prismaClient.user.update({
      where: { id: session.user.id as string },
      data: {
        toneChoice: toneChoice || null,
        perspective: perspective || null,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          toneChoice: updatedUser.toneChoice,
          perspective: updatedUser.perspective,
          description: updatedUser.description,
        },
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

