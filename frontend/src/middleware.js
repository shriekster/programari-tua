import { NextResponse } from 'next/server';

// Middleware currently only supports the Edge runtime; see
// https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime
// This function can be marked `async` if using `await` inside
export async function middleware(request) {

    const accessToken = request.cookies.get('access_token') ?? null;
    const refreshToken = request.cookies.get('refresh_token') ?? null;

    // TODO: get the private API endpoint from env variable
    const authorizationApiEndpoint = 'http://localhost:5000/api';

    const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
        }),
    };

    const response = await fetch(`${authorizationApiEndpoint}/authorizations`, requestOptions);
    console.log(response.status)

    
    //return NextResponse.redirect(new URL('/home', request.url));

};
 
// See
// https://nextjs.org/docs/app/building-your-application/routing/middleware#matching-paths
// to learn more about matching paths
export const config = {
  matcher: [
        '/admin/:path*'
    ],
};