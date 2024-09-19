'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { LaskettuValinnanVaihe } from '@/app/lib/types/laskenta-types';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { LaskettuJonoWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { getJonoNimi } from '../lib/get-jono-nimi';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';

export const ValintatapajonoAccordionTitle = ({
  valinnanVaihe,
  jono,
}: {
  valinnanVaihe: LaskettuValinnanVaihe;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  return (
    <AccordionBoxTitle
      title={getJonoNimi({
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
