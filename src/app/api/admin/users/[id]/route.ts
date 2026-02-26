import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserType } from "@prisma/client";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserType.ADMIN) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  // Safety: prevent admin from deleting themselves
  if (id === session.user.id) {
    return NextResponse.json(
      { success: false, message: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  try {
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} catch (e) {
  return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
}
}