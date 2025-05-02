import { useTranslations } from '@/lib/localization/useTranslations';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  Letter,
  LetterStats,
  templateNameOfLetterType,
} from '../lib/letter-options';
import { ExternalLink } from '@/components/external-link';

const buildLinkToPreview = (letter: Letter, hakuOid: string): string => {
  const templateName = templateNameOfLetterType.get(letter.letterType);
  return `valintalaskentakoostepalvelu/resources/viestintapalvelu/securelinkit/esikatselu?hakuOid=${hakuOid}&kirjeenTyyppi=${templateName}&asiointikieli=${letter.lang}`;
};

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
