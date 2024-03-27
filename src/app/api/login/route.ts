'use server'
 
import { cookies } from 'next/headers';
import cookie from 'cookie';
import {NextRequest, NextResponse} from "next/server";
import { configuration } from '@/app/lib/configuration';
import { validateService } from '@/app/lib/cas/client';
import axios from 'axios';

export async function GET(req: NextRequest) {
  console.log("LOGIN ROUTE GET")
  console.log(req.headers);
  console.log(req.cookies);
  console.log(req.credentials);
  console.log(req.url);
  const requestURL = new URL(req.url, configuration.serviceUrl);
  const ticket = requestURL.searchParams.get('ticket') || '';
  requestURL.searchParams.delete('ticket');
  const resp = await validateService(ticket, requestURL);
  console.log(cookies().getAll());
  console.log(resp);
  //cookies().set('TEMP', ticket);
  //cookies().set(configuration.sessionCookie, 'value', { secure: true });
  cookies().set(configuration.sessionCookie, ticket, {httpOnly: true, path: '/'});


  /*const client = axios.create({
    withCredentials: true,
    headers: {
      'Caller-id': '1.2.246.562.10.00000000001.ataru-editori.frontend', 
      'Content-type': 'Application/x-www-form-urlencoded',
      'CSRF': '1.2.246.562.10.00000000001.ataru-editori.frontend',
      'Cookie': `${cookie.serialize('CSRF', '1.2.246.562.10.00000000001.ataru-editori.frontend')};`
    },
  })*/
  //const tResp = await client.post('https://virkailija.untuvaopintopolku.fi/cas/v1/tickets', 'username=USER&password=PASSWORD');
  
  //console.log(tResp);
  //console.log(tResp.data);

  /*const headers = {
    accept: 'application/json', 
    'Caller-id': 'valintojen-toteuttaminen',
    'redirect-strategy': 'none',
    'throw-exception': false,
    cookie: cookie.serialize('session', 'session' || '', {httpOnly: true, path: '/'})
  };
  //const login = await axios.get('https://virkailija.untuvaopintopolku.fi/kouta-internal/auth/login');
  //console.log(login.headers);


  console.log(headers);
  
  const response = await axios.get(configuration.hautUrl, {
    headers,
    });
  console.log(response);*/

  return NextResponse.redirect('http://localhost:3404');
}
