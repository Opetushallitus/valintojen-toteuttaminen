'use client';

import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box } from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getLaskennanYhteenveto } from '@/lib/valintalaskenta/valintalaskenta-service';
import { ErrorAlert } from '@/components/error-alert';
import { unique } from 'remeda';

export const SeurantaItemError = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedotLaajennettu;
}) => {
  const { t } = useTranslations();

  const { data: summary } = useSuspenseQuery({
    queryKey: ['seuranta-virhe', seurantaTiedot.uuid],
    queryFn: () => getLaskennanYhteenveto(seurantaTiedot.uuid),
  });

  const summaryErrors = unique(
    summary?.hakukohteet
      .filter((hk) => hk?.tila !== 'VALMIS')
      .flatMap((hk) =>
        hk.ilmoitukset.map((i) => `${hk.hakukohdeOid}: ${i.otsikko}`),
      ),
  );

  return (
    <Box sx={{ gridArea: 'error' }}>
      <ErrorAlert
        title={t('valintalaskenta.valintalaskenta-epaonnistui')}
        message={summaryErrors}
        hasAccordion={summaryErrors?.length > 0}
      />
    </Box>
  );
};
