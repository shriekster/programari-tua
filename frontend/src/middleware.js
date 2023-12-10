import { NextResponse } from 'next/server';

// Middleware currently only supports the Edge runtime; see
// https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime
// This function can be marked `async` if using `await` inside
export async function middleware(request) {

    const accessToken = request.cookies.get('access_token') ?? null;
    const refreshToken = request.cookies.get('refresh_token') ?? null;

    // TODO: get the private API endpoint from env variable
    const privateApiEndpoint = 'http://localhost:5000/api/private';

    // TODO: get API key from env variable
    const apiKey = 'hXmL4OYgsn5Fu1Hr';

    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          apiKey
        }),
    };

    const response = await fetch(`${privateApiEndpoint}/authorizations`, requestOptions);
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