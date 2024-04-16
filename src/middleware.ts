import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes("/cas/login")) {
    console.log("middleware");
    console.log(request.nextUrl)
    const allCookies = request.cookies.getAll();
    console.log(allCookies);
    const res = NextResponse.next();
    console.log(res.headers)
    //console.log({ res_cookies: res.cookies.getAll() });
  }
}
