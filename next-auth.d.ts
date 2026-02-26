import { UserType } from '@prisma/client';
import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            isOath: boolean;
            role: UserType;
            competency: number | null;
            image: string | null;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        isOath: boolean;
        role: UserType;
        competency: number | null;
        image: string | null;
    }
}
