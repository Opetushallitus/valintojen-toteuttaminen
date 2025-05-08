import { buildConfiguration } from "./route-configuration";

export async function GET() {
  const DOMAIN = process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3404';
  return Response.json(buildConfiguration(DOMAIN));
}
