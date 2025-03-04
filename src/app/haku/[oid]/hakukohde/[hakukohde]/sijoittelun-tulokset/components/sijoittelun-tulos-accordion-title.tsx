'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { Haku } from '@/app/lib/kouta/kouta-types';
import { isKorkeakouluHaku } from '@/app/lib/kouta/kouta-service';
import { styled, Typography } from '@mui/material';

const Bolded = styled('span')(() => ({
  fontWeight: 700,
  display: 'inline',
}));

const Inline = styled('span')(() => ({
  display: 'inline',
}));

const TRANSLATIONS_PREFIX = 'sijoittelun-tulokset.taulukko.alaotsikko.';

export const SijoittelunTulosAccordionTitle = ({
  valintatapajono,
  haku,
}: {
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  haku: Haku;
}) => {
  const { t } = useTranslations();

  const varasijataytto = valintatapajono.varasijataytto
    ? t('sijoittelu.varasijataytto')
    : t('sijoittelu.ei-varasijatayttoa');

  const subtitle = (
    <Typography component="div" display="inline">
      (
      {isKorkeakouluHaku(haku) && (
        <Inline>
          <Bolded>{t(`${TRANSLATIONS_PREFIX}aloituspaikat`)}</Bolded>:{' '}
          {valintatapajono.alkuperaisetAloituspaikat} |&nbsp;
        </Inline>
      )}
      <Inline>
        <Bolded>{t(`${TRANSLATIONS_PREFIX}sijoittelun-aloituspaikat`)}</Bolded>:{' '}
        {valintatapajono.aloituspaikat} |&nbsp;
      </Inline>
      <Inline>
        <Bolded>{t(`${TRANSLATIONS_PREFIX}tasasijasaanto`)}</Bolded>:{' '}
        {t(`sijoittelu.tasasijasaanto.${valintatapajono.tasasijasaanto}`)}{' '}
        |&nbsp;
      </Inline>
      <Bolded>{varasijataytto}</Bolded>
      <Inline>
        &nbsp;|&nbsp;<Bolded>{t(`${TRANSLATIONS_PREFIX}prioriteetti`)}</Bolded>:{' '}
        {valintatapajono.prioriteetti}
      </Inline>
      )
    </Typography>
  );

  return <AccordionBoxTitle title={valintatapajono.nimi} subTitle={subtitle} />;
};
