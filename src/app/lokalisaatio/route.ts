import {
  configuration,
  isDev,
  isLocalhost,
  isTesting,
} from '@/lib/configuration';
import finnishTranslations from './fi.json';
import swedishTranslations from './sv.json';
import englishTranslations from './en.json';

const REVALIDATE_TIME_SECONDS = 60 * 60 * 2;

async function getTranslations(lng: string) {
  const res = await fetch(`${configuration.lokalisaatioUrl}${lng}`, {
    next: { revalidate: REVALIDATE_TIME_SECONDS },
  });
  const data = await res.json();
  const translations: Record<string, string> = {};
  for (const translation of data) {
    translations[translation.key] = translation.value;
  }
  return translations;
}

function getTranslationsFromFile(lng: string) {
  switch (lng) {
    case 'sv':
      return swedishTranslations;
    case 'en':
      return englishTranslations;
    default:
      return finnishTranslations;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lng = searchParams.get('lng') || 'fi';
  if (isLocalhost && (isDev || isTesting)) {
    return Response.json(getTranslationsFromFile(lng));
  } else {
    const translations: Record<string, string> = await getTranslations(lng);
    return Response.json(translations);
  }
}
