import { useTranslations } from '@/app/hooks/useTranslations';
import { CircularProgress, Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ExcelUploadButton } from './pistesyotto-excel-upload-button';
import { ExcelDownloadButton } from './pistesyotto-excel-download-button';

export const PisteSyottoActions = ({
  hakuOid,
  hakukohdeOid,
  isUpdating,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  isUpdating: boolean;
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
      <OphButton type="submit" variant="contained" disabled={isUpdating}>
        {t('yleinen.tallenna')}
      </OphButton>
      {isUpdating && (
        <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
      )}
      <ExcelDownloadButton hakuOid={hakuOid} hakukohdeOid={hakukohdeOid} />
      <ExcelUploadButton hakuOid={hakuOid} hakukohdeOid={hakukohdeOid} />
    </Stack>
  );
};
