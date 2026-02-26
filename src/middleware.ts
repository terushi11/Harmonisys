import NextAuth from 'next-auth';
import authConfig from './lib/auth.config';
import { privateRoutes } from './routes';

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const url = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isPrivateRoute = privateRoutes.includes(nextUrl.pathname);
    const isAuthRoute = nextUrl.pathname.includes('/auth');
    const isApiRoute = nextUrl.pathname.includes('/api');

    if (isApiRoute) {
        return;
    }

    if (isLoggedIn && isAuthRoute) {
        return Response.redirect(`${url}/dashboard`);
    }

    if (isAuthRoute && !isLoggedIn) return;

    if (!isLoggedIn && isPrivateRoute) {
        return Response.redirect(`${url}`);
    }
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

// export const config = {
//     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };
