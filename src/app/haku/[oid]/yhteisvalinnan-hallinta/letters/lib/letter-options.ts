import { Language } from '@/lib/localization/localization-types';
import { TFunction } from '@/lib/localization/useTranslations';
import { LetterCounts } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';

export enum LetterType {
  HYVAKSYMISKIRJE = 'hyvaksymiskirje',
  HYVAKSYMISKIRJE_HUOLTAJILLE = 'hyvaksymiskirje-huoltajille',
  JALKIOHJAUSKIRJE = 'jalkiohjauskirje',
  JALKIOHJAUSKIRJE_HUOLTAJILLE = 'jalkiohjauskirje-huoltajille',
  EI_HYVAKSYTTYJEN_KIRJE = 'ei-hyvaksytyt',
}

export const templateNameOfLetterType = new Map<LetterType, string>([
  [LetterType.HYVAKSYMISKIRJE, 'hyvaksymiskirje'],
  [LetterType.HYVAKSYMISKIRJE_HUOLTAJILLE, 'hyvaksymiskirje_huoltajille'],
  [LetterType.JALKIOHJAUSKIRJE, 'jalkiohjauskirje'],
  [LetterType.JALKIOHJAUSKIRJE_HUOLTAJILLE, 'jalkiohjauskirje_huoltajille'],
  [LetterType.EI_HYVAKSYTTYJEN_KIRJE, 'jalkiohjauskirje'],
]);

export type Letter = {
  id: number;
  lang: Language;
  letterType: LetterType;
};

function mapLetterOptions(kirjetyypit: Array<LetterType>): Array<Letter> {
  return kirjetyypit.flatMap((letterType, idx) => {
    const indexBase = idx * 3;
    return [
      { id: indexBase, lang: 'fi', letterType },
      { id: indexBase + 1, lang: 'sv', letterType },
      { id: indexBase + 2, lang: 'en', letterType },
    ];
  });
}

export const KK_KIRJETYYPIT: Array<Letter> = mapLetterOptions([
  LetterType.HYVAKSYMISKIRJE,
  LetterType.EI_HYVAKSYTTYJEN_KIRJE,
]);

export const TOINEN_ASTE_KIRJETYYPIT = mapLetterOptions([
  LetterType.HYVAKSYMISKIRJE,
  LetterType.HYVAKSYMISKIRJE_HUOLTAJILLE,
  LetterType.JALKIOHJAUSKIRJE,
  LetterType.JALKIOHJAUSKIRJE_HUOLTAJILLE,
]);

export type LetterStats = {
  id: number;
  letter: Letter;
  letterBatchId: string;
  letterProgressCount: number;
  letterTotalCount: number;
  letterReadyCount: number;
  letterErrorCount: number;
  letterPublishedCount: number;
  readyForPublish: boolean;
  readyForEPosti: boolean;
};

export function mapLetterCountsToLetterStats(
  letterCounts: Array<LetterCounts>,
): Array<LetterStats> {
  return letterCounts.map((lc, idx) => {
    const templateName = templateNameOfLetterType
      .entries()
      .find((val) => val[1] === lc.templateName)?.[0];
    return {
      id: idx,
      letter: { id: idx, letterType: templateName, lang: lc.lang },
      ...lc,
      letterBatchId: '' + (lc.letterBatchId ?? ''),
      letterProgressCount:
        lc.letterTotalCount - lc.letterErrorCount - lc.letterReadyCount,
    } as LetterStats;
  });
}

export function translateLetter(
  letter: Letter,
  t: TFunction,
  plural = false,
): string {
  const letterType = t(
    `kirjetyypit.${letter.letterType}${plural ? '-monikko' : ''}`,
  );
  const lang = t(`yleinen.kieleksi.${letter.lang}`);
  return `${letterType} ${lang}`;
}
