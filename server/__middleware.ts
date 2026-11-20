// import { NextResponse, type NextRequest } from "next/server";

// const PROTECTED_PREFIXES = ["/dashboard", "/doctors", "/patients"];

// export function middleware(request: NextRequest) {
//   const { pathname, search } = request.nextUrl;

//   const isProtected = PROTECTED_PREFIXES.some(
//     (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
//   );

//   if (!isProtected) {
//     return NextResponse.next();
//   }

//   const token = request.cookies.get("dt_auth_token")?.value;

//   if (!token || token.trim() === "") {
//     const loginUrl = new URL("/login", request.url);
//     const nextTarget = `${pathname}${search}`;
//     if (nextTarget && nextTarget !== "/") {
//       loginUrl.searchParams.set("next", nextTarget);
//     }
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/doctors/:path*", "/patients/:path*"],
// };