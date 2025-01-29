import { FullClientSpinner } from '@/app/components/client-spinner';
import { FileDownloadButton } from '@/app/components/file-download-button';
import { useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { downloadReadyProcessDocument } from '@/app/lib/valintalaskentakoostepalvelu';
import { Box, keyframes, styled, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { UseMutationResult } from '@tanstack/react-query';

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
    <OphModalDialog
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
    </OphModalDialog>
  ) : (
    <OphModalDialog
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
      <>
        <Typography>
          {mutation.isError ? 'Virhe' : 'Suoritus valmis'}
        </Typography>
      </>
    </OphModalDialog>
  );
};
