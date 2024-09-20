'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import { SijoitteluajonValintatapajono } from '@/app/lib/types/sijoittelu-types';

export const SijoittelunTulosAccordionTitle = ({
  valintatapajono,
}: {
  valintatapajono: SijoitteluajonValintatapajono;
}) => {
  const { t } = useTranslations();

  return (
    <AccordionBoxTitle
      title={`${t('sijoittelun-tulos.taulukko.otsikko')}: ${valintatapajono.nimi}`}
      subTitle={t('sijoittelun-tulos.taulukko.alaotsikko', {})}
    />
  );
};
