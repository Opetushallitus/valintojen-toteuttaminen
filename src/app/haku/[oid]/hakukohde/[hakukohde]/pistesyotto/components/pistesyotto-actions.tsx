import { useTranslations } from '@/app/hooks/useTranslations';
import { CircularProgress, Stack } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { PisteSyottoStates } from '@/app/lib/state/pistesyotto-state';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ExcelUploadButton } from './pistesyotto-excel-upload-button';
import { ExcelDownloadButton } from './pistesyotto-excel-download-button';

export const PisteSyottoActions = ({
  hakuOid,
  hakukohdeOid,
  state,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  state: AnyMachineSnapshot;
}) => {
  const { t } = useTranslations();

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'flex-start',
      }}
    >
      <OphButton
        type="submit"
        variant="contained"
        disabled={!state.matches(PisteSyottoStates.IDLE)}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      {state.matches(PisteSyottoStates.UPDATING) && (
        <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
      )}
      <ExcelDownloadButton hakuOid={hakuOid} hakukohdeOid={hakukohdeOid} />
      <ExcelUploadButton hakuOid={hakuOid} hakukohdeOid={hakukohdeOid} />
    </Stack>
  );
};
