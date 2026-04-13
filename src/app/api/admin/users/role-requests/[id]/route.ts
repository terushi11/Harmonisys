import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus, UserType } from "@prisma/client";

type PatchBody = { action?: "APPROVE" | "REJECT" };

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== UserType.ADMIN) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = params;
  const body = (await req.json().catch(() => null)) as PatchBody | null;
  const action = body?.action;

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );
  }

  const requestRow = await prisma.roleChangeRequest.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      fromRole: true,
      toRole: true,
      requestedMhpssLevel: true,
      status: true,
    },
  });

  if (!requestRow) {
    return NextResponse.json(
      { success: false, message: "Request not found." },
      { status: 404 }
    );
  }

  if (requestRow.status !== RequestStatus.PENDING) {
    return NextResponse.json(
      { success: false, message: "Request is not pending." },
      { status: 409 }
    );
  }

  if (
    requestRow.toRole !== UserType.RESPONDER &&
    requestRow.toRole !== UserType.ADMIN
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid requested role." },
      { status: 400 }
    );
  }

  if (
    requestRow.toRole === UserType.RESPONDER &&
    !requestRow.requestedMhpssLevel
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Responder approval requires a requested MHPSS level.",
      },
      { status: 400 }
    );
  }

  if (action === "REJECT") {
    await prisma.roleChangeRequest.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: requestRow.userId },
      data: {
        role: requestRow.toRole,
        mhpssLevel:
          requestRow.toRole === UserType.RESPONDER
            ? requestRow.requestedMhpssLevel
            : null,
      },
    }),
    prisma.roleChangeRequest.update({
      where: { id },
      data: {
        status: RequestStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}