import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';

export const ConfirmationModalDialog = ({
  open,
  onAnswer,
}: {
  open: boolean;
  onAnswer: (answer: boolean) => void;
}) => {
  const { t } = useTranslations();
  return (
    <OphModalDialog
      open={open}
      title={t('valinnanhallinta.varmista')}
      maxWidth="sm"
      actions={
        <>
          <OphButton
            variant="contained"
            onClick={() => {
              onAnswer(true);
            }}
          >
            {t('yleinen.kylla')}
          </OphButton>
          <OphButton
            variant="outlined"
            onClick={() => {
              onAnswer(false);
            }}
          >
            {t('yleinen.ei')}
          </OphButton>
        </>
      }
    />
  );
};
