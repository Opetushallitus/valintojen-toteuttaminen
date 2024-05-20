import { configuration } from '../lib/configuration';

const REVALIDATE_TIME_SECONDS = 60 * 60 * 2;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lng = searchParams.get('lng') || 'fi';
  const res = await fetch(`${configuration.lokalisaatioUrl}${lng}`, {
    next: { revalidate: REVALIDATE_TIME_SECONDS },
  });
  const data = await res.json();
  const translations: Record<string, string> = {};
  for (const translation of data) {
    translations[translation.key] = translation.value;
  }
  return Response.json(translations);
}
