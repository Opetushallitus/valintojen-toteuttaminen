import { useTranslations } from '@/app/lib/localization/useTranslations';
import { CircularProgress, Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { PistesyottoExcelUploadButton } from './pistesyotto-excel-upload-button';
import { PistesyottoExcelDownloadButton } from './pistesyotto-excel-download-button';

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
      <PistesyottoExcelDownloadButton
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
      />
      <PistesyottoExcelUploadButton
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
      />
    </Stack>
  );
};
