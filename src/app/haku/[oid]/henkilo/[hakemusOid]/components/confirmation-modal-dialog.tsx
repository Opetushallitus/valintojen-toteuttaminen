import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';

export type ConfirmationModalDialogProps = {
  title?: string;
  open: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  maxWidth?: 'sm' | 'md' | false;
};

export const ConfirmationModalDialog = ({
  title,
  open,
  children,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  maxWidth = 'sm',
}: ConfirmationModalDialogProps) => {
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
            variant="outlined"
            onClick={() => {
              onCancel();
            }}
          >
            {cancelLabel ?? t('yleinen.ei')}
          </OphButton>
          <OphButton
            variant="contained"
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel ?? t('yleinen.kylla')}
          </OphButton>
        </>
      }
    >
      {children}
    </OphModalDialog>
  );
};
