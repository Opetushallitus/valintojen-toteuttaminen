import { parseXml } from "./util";
import axios from "axios";

//Support for cas protocol version 3 only

export type Principal = {
  user: string,
  attributes?: Map<string, string>,
  pgt?: string,
};

class CasAgentError extends Error {}
class CasAgentAuthenticationError extends CasAgentError {
	constructor(message: string, xml: string) {
		super(message);
	}
}

async function parsePrincipal(data: string): Promise<Principal> {
  const result: any = await parseXml(data); //FIXME: TYPE
  console.log(result);
  const { authenticationSuccess } = result;

  if (!authenticationSuccess || !authenticationSuccess[0]) {
    throw new CasAgentAuthenticationError('Ticket authentication failed', data);
  }

  const { user, attributes } = authenticationSuccess[0];

  const parsedAttributes : Map<string, string> = new Map<string, string>();
  const allAttributes = attributes && attributes[0];

  for (const key in allAttributes) {
    const value = allAttributes[key].length > 1 ? allAttributes[key] : allAttributes[key][0];
    parsedAttributes.set(key, value);
  }

  return {user: user[0], attributes: parsedAttributes};
}


export async function validateService(ticket: string, serviceUrl: URL): Promise<Principal> {
  const validateUrl = new URL('https://virkailija.untuvaopintopolku.fi/cas/p3/serviceValidate');
  validateUrl.searchParams.set('service', serviceUrl.toString());
  validateUrl.searchParams.set('renew', 'false');

  console.log(validateUrl);

  const { data } = await axios.get(validateUrl.href, { params: {ticket}})

  return await parsePrincipal(data);
}