'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import { SijoitteluajonValintatapajonoEnriched } from '@/app/lib/types/sijoittelu-types';
import { Haku } from '@/app/lib/types/kouta-types';
import { isKorkeakouluHaku } from '@/app/lib/kouta';

export const SijoittelunTulosAccordionTitle = ({
  valintatapajono,
  haku,
}: {
  valintatapajono: SijoitteluajonValintatapajonoEnriched;
  haku: Haku;
}) => {
  const { t } = useTranslations();

  const translationSubTitle = isKorkeakouluHaku(haku)
    ? 'sijoittelun-tulokset.taulukko.alaotsikko'
    : 'sijoittelun-tulokset.taulukko.alaotsikkoperus';

  const subTitleParams = {
    aloituspaikat: valintatapajono.alkuperaisetAloituspaikat,
    sijoittelunAloituspaikat: valintatapajono.aloituspaikat,
    tasasijasaanto: t(
      'sijoittelu.tasasijasaanto.' + valintatapajono.tasasijasaanto,
    ),
    varasijataytto: valintatapajono.varasijataytto
      ? t('sijoittelu.varasijataytto')
      : t('sijoittelu.ei-varasijatayttoa'),
    prioriteetti: valintatapajono.prioriteetti,
  };

  return (
    <AccordionBoxTitle
      title={valintatapajono.nimi}
      subTitle={t(translationSubTitle, subTitleParams)}
    />
  );
};
