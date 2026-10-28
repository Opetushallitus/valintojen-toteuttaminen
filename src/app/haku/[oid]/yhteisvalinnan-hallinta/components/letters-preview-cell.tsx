import { useTranslations } from '@/lib/localization/useTranslations';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  Letter,
  LetterStats,
  templateNameOfLetterType,
} from '../lib/letter-options';
import { ExternalLink } from '@/components/external-link';
import { buildLinkToKirjeenEsikatselu } from '@/lib/externalLinks';

const buildLinkToPreview = (letter: Letter, hakuOid: string): string =>
  buildLinkToKirjeenEsikatselu({
    hakuOid,
    kirjeenTyyppi: templateNameOfLetterType.get(letter.letterType) ?? '',
    asiointikieli: letter.lang,
  });

export const LettersPreviewCell = ({
  haku,
  letterStats,
}: {
  haku: Haku;
  letterStats: LetterStats;
}) => {
  const { t } = useTranslations();

  return (
    <ExternalLink
      noIcon={true}
      name={t('yhteisvalinnan-hallinta.kirjeet.esikatsele')}
      href={buildLinkToPreview(letterStats.letter, haku.oid)}
    />
  );
};
