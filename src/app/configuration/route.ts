import { configuration } from "@/lib/configuration";

export async function GET(_: Request) {
  return Response.json(configuration);
}
