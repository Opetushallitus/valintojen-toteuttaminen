'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  LaskettuJonoWithHakijaInfo,
  LaskettuValinnanvaihe,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import { TFunction } from 'i18next';

const makeSubtitle = ({
  createdAt,
  prioriteetti,
  t,
}: {
  createdAt?: number;
  prioriteetti: number;
  t: TFunction;
}) => {
  const createdPart = createdAt
    ? `${toFormattedDateTimeString(createdAt)} | `
    : '';
  return `(` + createdPart + `${t('yleinen.prioriteetti')}: ${prioriteetti})`;
};

export const ValintatapajonoAccordionTitle = ({
  valinnanVaihe,
  jono,
}: {
  valinnanVaihe: LaskettuValinnanvaihe;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  return (
    <AccordionBoxTitle
      title={getValintatapaJonoNimi({
        valinnanVaiheNimi: valinnanVaihe.nimi,
        jonoNimi: jono.nimi,
      })}
      subTitle={makeSubtitle({
        createdAt: valinnanVaihe.createdAt,
        prioriteetti: jono.prioriteetti,
        t,
      })}
    />
  );
};
