import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, CircularProgress } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { PisteSyottoStates } from '../lib/pistesyotto-state';
import { OphButton } from '@opetushallitus/oph-design-system';
import { DownloadButton } from '@/app/components/download-button';
import { useTranslation } from 'react-i18next';
import { downloadBlob } from '@/app/lib/common';
import { getPistesyottoExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import useToaster from '@/app/hooks/useToaster';
import { useMutation } from '@tanstack/react-query';

const useExcelDownloadMutation = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getPistesyottoExcel({
        hakuOid,
        hakukohdeOid,
      });
      downloadBlob(fileName ?? 'pistesyotto.xls', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-valintakoe-excel',
        message: 'valintalaskennan-tulos.virhe-vie-kaikki-taulukkolaskentaan',
        type: 'error',
      });
      console.error(e);
    },
  });
};

const ExcelDownloadButton = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { t } = useTranslation();

  const excelMutation = useExcelDownloadMutation({
    hakuOid,
    hakukohdeOid,
  });

  return (
    <DownloadButton mutation={excelMutation}>
      {t('yleinen.vie-taulukkolaskentaan')}
    </DownloadButton>
  );
};
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: 2,
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
    </Box>
  );
};
