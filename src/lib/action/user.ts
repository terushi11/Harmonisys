'use server';

import { prisma } from '@/lib/prisma';
import { signIn, signOut } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { UserType } from '@prisma/client';

export const handleGoogleLogin = async () => {
    await signIn('google', { redirectTo: '/' });
    revalidatePath('/');
};

export const handleSignOut = async () => {
    await signOut();
};

export const getUserById = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });

        return user;
    } catch {
        return null;
    }
};

export const getAccountById = async (userId: string) => {
    try {
        const account = await prisma.account.findFirst({ where: { userId } });

        return account;
    } catch {
        return null;
    }
};

export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        competency: true,
        createdAt: true,

        // latest pending role request (if any)
        roleChangeRequests: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            fromRole: true,
            toRole: true,
            status: true,
            createdAt: true,
          },
        },

        // keep these excluded
        updatedAt: false,
        image: false,
        password: false,
      },
      orderBy: {
        name: "asc",
      },
    });

    const results = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      competency: u.competency,
      createdAt: u.createdAt,
      pendingRoleRequest: u.roleChangeRequests?.[0] ?? null,
    }));

    const totalUsers = await prisma.user.count();

    return {
      count: totalUsers,
      results,
    };
  } catch (err) {
    console.error("Error fetching users:", err);
    return { error: "Failed to fetch users" };
  }
};

export const updateUserCompetency = async (
    userId: string,
    newCompetency: number | null
) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { competency: newCompetency },
        });

        return updatedUser;
    } catch (err) {
        console.error('Error updating user competency:', err);
        return { error: 'Failed to update user competency' };
    }
};

export async function updateUserRole(userId: string, role: UserType) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}
