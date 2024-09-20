'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import { SijoitteluajonValintatapajonoEnriched } from '@/app/lib/types/sijoittelu-types';

export const SijoittelunTulosAccordionTitle = ({
  valintatapajono,
}: {
  valintatapajono: SijoitteluajonValintatapajonoEnriched;
}) => {
  const { t } = useTranslations();

  return (
    <AccordionBoxTitle
      title={valintatapajono.nimi}
      subTitle={t('sijoittelun-tulokset.taulukko.alaotsikko', {
        aloituspaikat: valintatapajono.aloituspaikat,
        sijoittelunAloituspaikat: 0, //TODO
        tasasijasaanto: t(
          'sijoittelu.tasasijasaanto.' + valintatapajono.tasasijasaanto,
        ),
        varasijataytto: valintatapajono.varasijataytto
          ? t('sijoittelu.varasijataytto')
          : t('sijoittelu.ei-varasijatayttoa'),
        prioriteetti: valintatapajono.prioriteetti,
      })}
    />
  );
};
