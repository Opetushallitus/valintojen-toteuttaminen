import { useTranslations } from '@/lib/localization/useTranslations';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { SijoitteluajonValintatapajonoValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { Haku } from '@/lib/kouta/kouta-types';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { Typography } from '@mui/material';
import { styled } from '@/lib/theme';

const Bold = styled('span')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
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
        <span>
          <Bold>{t(`${TRANSLATIONS_PREFIX}aloituspaikat`)}</Bold>:{' '}
          {valintatapajono.alkuperaisetAloituspaikat} |&nbsp;
        </span>
      )}
      <span>
        <Bold>{t(`${TRANSLATIONS_PREFIX}sijoittelun-aloituspaikat`)}</Bold>:{' '}
        {valintatapajono.aloituspaikat} |&nbsp;
      </span>
      <span>
        <Bold>{t(`${TRANSLATIONS_PREFIX}tasasijasaanto`)}</Bold>:{' '}
        {t(`sijoittelu.tasasijasaanto.${valintatapajono.tasasijasaanto}`)}{' '}
        |&nbsp;
      </span>
      <Bold>{varasijataytto}</Bold>
      <span>
        &nbsp;|&nbsp;
        <Bold>{t(`${TRANSLATIONS_PREFIX}prioriteetti`)}</Bold>:{' '}
        {valintatapajono.prioriteetti}
      </span>
      )
    </Typography>
  );

  return <AccordionBoxTitle title={valintatapajono.nimi} subTitle={subtitle} />;
};
