import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const requestURL = new URL(req.url);
  const ticket = requestURL.searchParams.get("ticket") ?? "";

  if (ticket !== "") {
    requestURL.searchParams.delete("ticket");
    return NextResponse.redirect(requestURL)
  }
}
