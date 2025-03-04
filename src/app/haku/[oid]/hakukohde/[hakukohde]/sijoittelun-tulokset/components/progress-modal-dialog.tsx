import { FullClientSpinner } from '@/components/client-spinner';
import { ErrorTable } from '@/components/error-table';
import { FileDownloadButton } from '@/components/file-download-button';
import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { OphModal } from '@/components/modals/oph-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isEmpty, OphProcessError, OphProcessErrorData } from '@/lib/common';
import { downloadReadyProcessDocument } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { Box, keyframes, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { styled } from '@/lib/theme';

const translate = keyframes`
  0%,
  10%,
  90%,
  100% {
      opacity: 1;
      transform: translateY(1rem)
  }
  25%,
  65% {
      opacity: 0;
      translateY(0);
  }
`;

const ProgressMessage = styled(Box)(() => ({
  position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  animation: `${translate} 8s infinite ease`,
  '&:last-child': {
    animationDelay: '-4s',
  },
}));

const ProgressContainer = ({
  progressMessage,
}: {
  progressMessage: string;
}) => {
  const { t } = useTranslations();

  return (
    <>
      <FullClientSpinner />
      <Box sx={{ position: 'relative', height: '4rem', width: '100%' }}>
        <ProgressMessage>{t(progressMessage)}</ProgressMessage>
        <ProgressMessage>{t('yleinen.suoritus-etenee')}</ProgressMessage>
      </Box>
    </>
  );
};

const ErrorContainer = ({ error }: { error: Error | OphProcessError }) => {
  const { t } = useTranslations();
  const errorData: Array<OphProcessErrorData> =
    error instanceof OphProcessError ? error.processObject : [];
  const serviceErrors = errorData.filter((e) => e.isService);
  const normalErrors = errorData.filter((e) => !e.isService);

  return !isEmpty(errorData) ? (
    <Box sx={{ display: 'flex', rowGap: '0.5rem', flexDirection: 'column' }}>
      <Typography>{t('virhe.dokumentin-luonti')}</Typography>
      {!isEmpty(serviceErrors) && (
        <>
          {serviceErrors.map((e) => (
            <Box key={e.id}>
              <Typography variant="h2">{e.id}</Typography>
              <Typography>{t(e.message)}</Typography>
            </Box>
          ))}
        </>
      )}
      {!isEmpty(normalErrors) && (
        <Box>
          <Typography variant="h2">{t('virhe.varoitukset')}</Typography>
          <ErrorTable error={error} />
        </Box>
      )}
    </Box>
  ) : (
    <Box>
      <Typography>{t('virhe.dokumentin-luonti')}</Typography>
      <ErrorTable error={error} />
    </Box>
  );
};

export const ProgressModalDialog = ({
  title,
  progressMessage,
  mutation,
  defaultFileName,
}: {
  title: string;
  progressMessage: string;
  mutation: UseMutationResult<string, Error, void, unknown>;
  defaultFileName: string;
}) => {
  const modalProps = useOphModalProps();

  const { t } = useTranslations();

  return mutation.isPending ? (
    <OphModal
      {...modalProps}
      title={t(title)}
      maxWidth="md"
      actions={
        <>
          <OphButton variant="outlined" onClick={() => mutation.reset()}>
            {t('yleinen.peruuta')}
          </OphButton>
        </>
      }
    >
      <ProgressContainer progressMessage={progressMessage} />
    </OphModal>
  ) : (
    <OphModal
      {...modalProps}
      title={t(title)}
      maxWidth="md"
      actions={
        <>
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
          {mutation.data && (
            <FileDownloadButton
              variant="contained"
              defaultFileName={defaultFileName}
              errorKey={`get-${title}-file`}
              errorMessage="virhe.tiedosto-lataus"
              getFile={() => downloadReadyProcessDocument(mutation.data)}
            >
              {t('yleinen.lataa')}
            </FileDownloadButton>
          )}
        </>
      }
    >
      {mutation.isError && <ErrorContainer error={mutation.error} />}
      {mutation.isSuccess && <Typography>Suoritus valmis</Typography>}
    </OphModal>
  );
};

export const ProgressModal = createModal(
  ({
    title,
    progressMessage,
    functionToMutate,
    defaultFileName,
    setDocument,
  }: {
    title: string;
    progressMessage: string;
    functionToMutate: () => Promise<string>;
    defaultFileName: string;
    setDocument?: (docId: string) => void;
  }) => {
    const mutation = useMutation({
      onError: (e) => {
        console.error(e);
      },
      mutationFn: async () => await functionToMutate(),
      onSuccess: (data) => {
        if (setDocument) {
          setDocument(data);
        }
      },
    });

    useEffect(() => {
      if (!(mutation.isPending || mutation.data || mutation.error)) {
        mutation.mutate();
      }
    }, [mutation]);

    return (
      <ProgressModalDialog
        title={title}
        progressMessage={progressMessage}
        defaultFileName={defaultFileName}
        mutation={mutation}
      />
    );
  },
);
