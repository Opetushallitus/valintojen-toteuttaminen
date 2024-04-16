import { cookies } from "next/headers";
import cookie from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { configuration } from "@/app/lib/configuration";
import { validateService } from "@/app/lib/cas/client";
import axios from "axios";

export const dynamic = "force-dynamic";

const basePath = process.env.basePath ?? "/";

export async function GET(req: NextRequest) {
  console.log("LOGIN ROUTE GET");
  //console.log(req.credentials);
  //console.log(req.url);
  const nextRequestURL = new URL(req.url);
  const ticket = nextRequestURL.searchParams.get("ticket") || "";
  const requestURL = new URL(
    configuration.serviceUrl + nextRequestURL.pathname
  );
  requestURL.searchParams.delete("ticket");
  //SHOULD NOT BE NECESSARY TO VALIDATE?
  await validateService(ticket, requestURL);
  //console.log(cookies().getAll());
  //console.log(resp);
  //cookies().set('TEMP', ticket);
  //cookies().set(configuration.sessionCookie, 'value', { secure: true });
  cookies().set(configuration.sessionCookie, ticket, {
    httpOnly: true,
    path: basePath,
  });

  return NextResponse.redirect(new URL(basePath, req.url));
}
