'use client';
import { useTranslations } from '@/app/lib/localization/useTranslations';
import { HakukohteenHakijaryhma } from '@/app/lib/types/laskenta-types';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';

export const HakijaryhmaAccordionTitle = ({
  hakijaryhma,
}: {
  hakijaryhma: HakukohteenHakijaryhma;
}) => {
  const { t } = useTranslations();

  return (
    <AccordionBoxTitle
      title={`${t('hakijaryhmat.taulukko.otsikko')}: ${hakijaryhma.nimi}`}
      subTitle={t('hakijaryhmat.kiintio', { kiintio: hakijaryhma.kiintio })}
    />
  );
};
