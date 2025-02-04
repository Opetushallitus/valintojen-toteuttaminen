'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  LaskennanValintatapajonoTulosWithHakijaInfo,
  LaskennanValinnanvaiheTulos,
} from '@/app/hooks/useEditableValintalaskennanTulokset';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import { TFunction } from 'i18next';

const makeSubtitle = ({
  createdAt,
  prioriteetti,
  t,
}: {
  createdAt: number | null;
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
  valinnanVaihe: LaskennanValinnanvaiheTulos;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
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
