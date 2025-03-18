'use client';
import { TFunction, useTranslations } from '@/lib/localization/useTranslations';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import {
  LaskennanValintatapajonoTulosWithHakijaInfo,
  LaskennanValinnanvaiheTulos,
} from '@/hooks/useEditableValintalaskennanTulokset';
import { getValintatapaJonoNimi } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { AccordionBoxTitle } from '@/components/accordion-box-title';

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
