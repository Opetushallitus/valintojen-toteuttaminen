import { OphModal } from '@/components/modals/oph-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';

export type ConfirmationModalProps = {
  title: string;
  open: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  maxWidth?: 'sm' | 'md' | false;
};

export const ConfirmationModal = ({
  title,
  open,
  children,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  maxWidth = 'sm',
}: ConfirmationModalProps) => {
  const { t } = useTranslations();
  return (
    <OphModal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidth={maxWidth}
      actions={
        <>
          <OphButton variant="outlined" onClick={onCancel}>
            {cancelLabel ?? t('yleinen.ei')}
          </OphButton>
          <OphButton variant="contained" onClick={onConfirm}>
            {confirmLabel ?? t('yleinen.kylla')}
          </OphButton>
        </>
      }
    >
      {children}
    </OphModal>
  );
};
