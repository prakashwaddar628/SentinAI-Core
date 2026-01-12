import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define which routes are PROTECTED (require login)
// We protect everything EXCEPT sign-in and sign-up pages.
const isProtectedRoute = createRouteMatcher([
  "/((?!sign-in|sign-up).*)", // Matches everything except sign-in/up
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the user is trying to access a protected route and isn't logged in, redirect them.
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
