'use client';

import { SeurantaTiedotLaajennettu } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getLaskennanYhteenveto } from '@/lib/valintalaskenta/valintalaskenta-service';
import { ErrorAlert } from '@/components/error-alert';
import { unique, uniqueBy } from 'remeda';
import { styled } from '@/lib/theme';
import { OphButton } from '@opetushallitus/oph-design-system';
import useToaster from '@/hooks/useToaster';

type ErrorMessage = {
  hakukohdeOid: string;
  message: string;
  key: string;
};

const StyledMessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1),
  alignItems: 'flex-start',
}));

const StyledMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
}));

const ErrorsChildren = ({
  errorMessages,
}: {
  errorMessages: Array<ErrorMessage>;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  function copyToClipBoard(messages: Array<ErrorMessage>) {
    const hakukohdeOids = unique(messages.map((e) => e.hakukohdeOid));
    navigator.clipboard.writeText(hakukohdeOids.join('\n'));
    addToast({
      key: 'hakukohdeoids-copied-to-clipboard',
      message: t('seuranta.kopioitu-leikepoydalle'),
      type: 'success',
    });
  }

  return (
    <StyledMessageContainer>
      <OphButton
        sx={{ marginBottom: '5px', flexBasis: 'auto', paddingLeft: 0 }}
        onClick={() => copyToClipBoard(errorMessages)}
        variant="text"
      >
        {t('seuranta.kopioi-leikepoydalle')}
      </OphButton>
      {errorMessages.map((errorMessage) => (
        <StyledMessage key={errorMessage.key}>
          <Typography variant="body1">{errorMessage.hakukohdeOid}</Typography>
          <Typography variant="body2">{errorMessage.message}</Typography>
        </StyledMessage>
      ))}
    </StyledMessageContainer>
  );
};

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

  const summaryErrors = uniqueBy(
    summary?.hakukohteet
      .filter((hk) => ['VIRHE', 'KESKEYTETTY'].includes(hk?.tila))
      .flatMap((hk) =>
        hk.ilmoitukset.map((i, index) => ({
          key: `${hk.hakukohdeOid}-${index}`,
          hakukohdeOid: hk.hakukohdeOid,
          message: i.otsikko,
        })),
      ),
    (m) => m.hakukohdeOid + m.message,
  );

  return (
    <Box sx={{ gridArea: 'error', backgroundColor: 'rgb(250, 238, 234)' }}>
      <ErrorAlert
        title={t('valintalaskenta.valintalaskenta-epaonnistui')}
        messageChildren={<ErrorsChildren errorMessages={summaryErrors} />}
        hasAccordion={summaryErrors?.length > 0}
      />
    </Box>
  );
};
