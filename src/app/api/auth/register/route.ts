import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Gender, MhpssLevel, RequestStatus, UserType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      gender,
      region,
      mhpssLevel,
      role,
      privacyPolicyAccepted,
      email,
      password,
      confirmPassword,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !region ||
      !role ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (!privacyPolicyAccepted) {
      return NextResponse.json(
        { success: false, message: 'You must agree to the Privacy Policy.' },
        { status: 400 }
      );
    }

    if (!['MALE', 'FEMALE'].includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Invalid gender selected.' },
        { status: 400 }
      );
    }

    if (!['STANDARD', 'RESPONDER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role selected.' },
        { status: 400 }
      );
    }

    if (
      mhpssLevel &&
      !['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'].includes(mhpssLevel)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid MHPSS Level selected.' },
        { status: 400 }
      );
    }

    if (role === 'RESPONDER' && !mhpssLevel) {
      return NextResponse.json(
        { success: false, message: 'MHPSS Level is required for responders.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already registered.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();

    const user = await prisma.user.create({
      data: {
        name: fullName,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        gender: gender as Gender,
        region: String(region).trim(),

        // Active values stay safe until admin approval
        role: UserType.STANDARD,
        mhpssLevel: null,

        privacyPolicyAccepted: Boolean(privacyPolicyAccepted),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Create pending request only when user asked for elevated access
    if (role !== 'STANDARD') {
      await prisma.roleChangeRequest.create({
        data: {
          userId: user.id,
          fromRole: UserType.STANDARD,
          toRole: role as UserType,

          // requires this field in Prisma model
          requestedMhpssLevel:
            role === 'RESPONDER' ? (mhpssLevel as MhpssLevel) : null,

          status: RequestStatus.PENDING,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          role === 'STANDARD'
            ? 'Registration successful.'
            : 'Registration successful. Your requested role is pending admin approval.',
        user: {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          gender: user.gender,
          region: user.region,
          mhpssLevel: user.mhpssLevel,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);

    return NextResponse.json(
      { success: false, message: 'Something went wrong during registration.' },
      { status: 500 }
    );
  }
}