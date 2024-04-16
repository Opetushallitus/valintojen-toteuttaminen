import { cookies } from "next/headers";
import cookie from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { configuration } from "@/app/lib/configuration";
import { validateService } from "@/app/lib/cas/client";
import axios from "axios";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  console.log("LOGIN ROUTE GET");
  console.log("req cookies", req.cookies.getAll());
  console.log("cookies", cookies().getAll());
  //console.log(req.cookies);
  // if(res) {
  //   console.log(res.getHeaders())
  // }
  //console.log(req.credentials);
  //console.log(req.url);
  const requestURL = new URL(req.url, configuration.serviceUrl);
  const ticket = requestURL.searchParams.get("ticket") || "";
  requestURL.searchParams.delete("ticket");
  //SHOULD NOT BE NECESSARY TO VALIDATE?
  //const resp = await validateService(ticket, requestURL);
  //console.log(cookies().getAll());
  //console.log(resp);
  //cookies().set('TEMP', ticket);
  //cookies().set(configuration.sessionCookie, 'value', { secure: true });
  cookies().set(configuration.sessionCookie, ticket, {
    httpOnly: true,
    path: "/",
  });

  return NextResponse.redirect("https://localhost:3404");
}
