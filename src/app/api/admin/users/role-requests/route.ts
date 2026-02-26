export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus, UserType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserType.STANDARD) {
      return NextResponse.json(
        { success: false, message: "Only STANDARD users can request role changes." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const toRole = body?.toRole as UserType | undefined;

    if (!toRole || (toRole !== UserType.RESPONDER && toRole !== UserType.ADMIN)) {
      return NextResponse.json({ success: false, message: "Invalid target role." }, { status: 400 });
    }

    const existing = await prisma.roleChangeRequest.findFirst({
      where: { userId: session.user.id, status: RequestStatus.PENDING },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "You already have a pending request." },
        { status: 409 }
      );
    }

    const created = await prisma.roleChangeRequest.create({
      data: {
        userId: session.user.id,
        fromRole: session.user.role as UserType,
        toRole,
        status: RequestStatus.PENDING,
      },
      select: {
        id: true,
        userId: true,
        fromRole: true,
        toRole: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    console.error("POST /api/admin/users/role-requests error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserType.ADMIN) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const requests = await prisma.roleChangeRequest.findMany({
      where: { status: RequestStatus.PENDING },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            competency: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (err: any) {
    console.error("GET /api/admin/users/role-requests error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}