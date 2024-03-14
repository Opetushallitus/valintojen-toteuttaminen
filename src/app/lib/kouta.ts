import { cookies } from "next/headers";
import { configuration } from "./configuration";
import axios from "axios";
import cookie from 'cookie';

const KOUTA_COOKIE_NAME = 'session';
const KOUTA_COOKIE_PATH = 'kouta-internal'

export async function getHaut(active: boolean = true) {
  console.log('here');
  const ticket = cookies().get(configuration.sessionCookie)?.value;
  const headers = {
    accept: 'application/json', 
    'Caller-id': 'valintojen-toteuttaminen',
    'redirect-strategy': 'none',
    'throw-exception': false,
    cookie: cookie.serialize('session', ticket || '', {httpOnly: true, path: '/'})
  };
  //const login = await axios.get('https://virkailija.untuvaopintopolku.fi/kouta-internal/auth/login');
  //console.log(login.headers);


  console.log(headers);
  
  const response = await axios.get(configuration.hautUrl, {
    headers,
    });
  console.log(response);
  return response;
}
