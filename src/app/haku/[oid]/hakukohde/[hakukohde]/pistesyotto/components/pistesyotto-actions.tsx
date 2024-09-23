import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, CircularProgress } from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { PisteSyottoStates } from '../lib/pistesyotto-state';
import { OphButton } from '@opetushallitus/oph-design-system';
import { DownloadButton } from '@/app/components/download-button';
import { useTranslation } from 'react-i18next';
import { downloadBlob } from '@/app/lib/common';
import {
  getPistesyottoExcel,
  putPistesyottoExcel,
} from '@/app/lib/valintalaskentakoostepalvelu';
import useToaster from '@/app/hooks/useToaster';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId, useRef, useState } from 'react';
import { FileUploadOutlined } from '@mui/icons-material';
import { pisteTuloksetOptions } from '../hooks/usePisteTulokset';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { PistesyottoTuontiResult } from './pistesyotto-tuonti-results';

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
        key: 'get-pistesyotto-excel',
        message: 'pistesyotto.virhe-vie-taulukkolaskentaan',
        type: 'error',
      });
      console.error(e);
    },
  });
};

const useExcelUploadMutation = ({
  hakuOid,
  hakukohdeOid,
  showErrorModal,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  showErrorModal: (e: Error) => void;
}) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      await putPistesyottoExcel({
        hakuOid,
        hakukohdeOid,
        excelFile: file,
      });
    },
    onError: (e) => {
      showErrorModal(e);
    },
    onSuccess: () => {
      addToast({
        key: 'put-pistesyotto-excel-success',
        message: 'pistesyotto.tuo-valintalaskennasta-onnistui',
        type: 'success',
      });

      // Ladataan muuttuneet pistetulokset
      const options = pisteTuloksetOptions({ hakuOid, hakukohdeOid });
      queryClient.resetQueries(options);
      queryClient.invalidateQueries(options);
    },
  });
};

const ExcelUploadButton = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { t } = useTranslation();
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const { mutate, isPending } = useExcelUploadMutation({
    hakuOid,
    hakukohdeOid,
    showErrorModal: (e) => setUploadError(e),
  });

  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        id={id}
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => {
          const files = event.currentTarget.files;
          if (files) {
            mutate({ file: files[0] });
          }
          if (inputRef.current) {
            // Tyhjennetään kentän arvo, jotta onChange kutsutaan myös seuraavalla kerralla, vaikka valitaan sama tiedosto
            inputRef.current.value = '';
          }
        }}
      />
      <OphModalDialog
        title={t('pistesyotto.virhe-tuo-taulukkolaskennasta')}
        fullWidth={true}
        maxWidth="lg"
        open={Boolean(uploadError)}
        onClose={() => setUploadError(null)}
        actions={
          <OphButton variant="outlined" onClick={() => setUploadError(null)}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        {uploadError && <PistesyottoTuontiResult error={uploadError} />}
      </OphModalDialog>
      <OphModalDialog
        titleAlign="center"
        maxWidth="md"
        open={isPending}
        title={t('pistesyotto.tuodaan-pistetietoja-taulukkolaskennasta')}
      >
        <FullClientSpinner />
      </OphModalDialog>
      <OphButton
        disabled={isPending}
        startIcon={<FileUploadOutlined />}
        onClick={() => {
          // Avataan tiedostovalitsin kohdistamalla input-kenttään
          inputRef?.current?.click();
        }}
      >
        {t('yleinen.tuo-taulukkolaskennasta')}
      </OphButton>
    </>
  );
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
      <ExcelUploadButton hakuOid={hakuOid} hakukohdeOid={hakukohdeOid} />
    </Box>
  );
};
