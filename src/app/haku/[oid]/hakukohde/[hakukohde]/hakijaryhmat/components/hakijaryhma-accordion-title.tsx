'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { HakukohteenHakijaryhma } from '@/lib/types/laskenta-types';
import { AccordionBoxTitle } from '@/components/accordion-box-title';

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
