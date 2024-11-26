'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { LaskettuValinnanVaiheModel } from '@/app/lib/types/laskenta-types';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { LaskettuJonoWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';

export const ValintatapajonoAccordionTitle = ({
  valinnanVaihe,
  jono,
}: {
  valinnanVaihe: LaskettuValinnanVaiheModel;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  return (
    <AccordionBoxTitle
      title={getValintatapaJonoNimi({
        valinnanVaiheNimi: valinnanVaihe.nimi,
        jonoNimi: jono.nimi,
      })}
      subTitle={
        `(${toFormattedDateTimeString(valinnanVaihe.createdAt)}` +
        ` | ${t('yleinen.prioriteetti')}: ${jono.prioriteetti})`
      }
    />
  );
};
