import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';

export const ConfirmationModalDialog = ({
  title,
  open,
  children,
  onConfirm,
  onCancel,
  maxWidth = 'sm',
}: {
  title?: string;
  open: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  maxWidth?: 'sm' | 'md' | false;
}) => {
  const { t } = useTranslations();
  return (
    <OphModalDialog
      open={open}
      onClose={() => onCancel()}
      title={title ?? t('valinnanhallinta.varmista')}
      maxWidth={maxWidth}
      actions={
        <>
          <OphButton
            variant="contained"
            onClick={() => {
              onConfirm();
            }}
          >
            {t('yleinen.kylla')}
          </OphButton>
          <OphButton
            variant="outlined"
            onClick={() => {
              onCancel();
            }}
          >
            {t('yleinen.ei')}
          </OphButton>
        </>
      }
    >
      {children}
    </OphModalDialog>
  );
};
