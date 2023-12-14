import { NextResponse } from 'next/server';

// Middleware currently only supports the Edge runtime; see
// https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime
// This function can be marked `async` if using `await` inside
export async function middleware(request) {

    const accessToken = request.cookies.get('access_token')?.value ?? null;
    const refreshToken = request.cookies.get('refresh_token')?.value ?? null;

    console.log(accessToken, refreshToken)

    // TODO: get the API base URL from env variable
    const apiBaseUrl = 'http://localhost:5000/api';

    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
        }),
    };

    const response = await fetch(`${apiBaseUrl}/tokens`, requestOptions);
    console.log(response.status)

    
    //return NextResponse.redirect(new URL('/home', request.url));

};
 
// See
// https://nextjs.org/docs/app/building-your-application/routing/middleware#matching-paths
// to learn more about matching paths
export const config = {
  matcher: [
        '/admin'
    ],
};