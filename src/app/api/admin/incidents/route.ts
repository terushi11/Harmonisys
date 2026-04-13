import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'RESPONDER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'ALL';
  const severity = searchParams.get('severity') || 'ALL';

  const incidents = await prisma.incident.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { summary: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
                { teamDeployed: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
        status !== 'ALL' ? { status: status as any } : {},
        severity !== 'ALL' ? { severity: severity as any } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: incidents });
}