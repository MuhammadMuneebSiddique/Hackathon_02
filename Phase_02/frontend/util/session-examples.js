// import { auth } from '../lib/better-auth-server'; // path to your Better Auth server instance
// import { headers } from 'next/headers';

// // Example server-side session usage
// export async function getUserSession() {
//   const session = await auth.api.getSession({
//     headers: await headers() // you need to pass the headers object.
//   });

//   return session;
// }

// // Example API route for getting user session
// export async function GET(request) {
//   const session = await auth.api.getSession({
//     headers: new Headers(request.headers),
//   });

//   if (!session) {
//     return Response.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   return Response.json({ user: session.user, expiresAt: session.expiresAt });
// }