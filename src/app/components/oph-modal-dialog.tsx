import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useId } from 'react';
import { useTranslations } from '@/app/lib/localization/useTranslations';

export type OphModalDialogProps = Pick<
  DialogProps,
  'slotProps' | 'open' | 'children' | 'maxWidth' | 'fullWidth'
> & {
  titleAlign?: 'center' | 'left';
  contentAlign?: 'center' | 'left';
  children?: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  onClose?: (
    event: unknown,
    reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick',
  ) => void;
};

export const OphModalDialog = ({
  open,
  titleAlign = 'left',
  contentAlign = 'left',
  children,
  actions,
  title,
  maxWidth,
  fullWidth = true,
  onClose,
  slotProps,
}: OphModalDialogProps) => {
  const modalId = useId();
  const modalTitleId = `${modalId}-title`;
  const { t } = useTranslations();
  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      sx={{ minWidth: '500px' }}
      open={open}
      aria-labelledby={modalTitleId}
      onClose={onClose}
      slotProps={slotProps}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          columnGap: 1,
        }}
        id={modalTitleId}
      >
        <Box sx={{ textAlign: titleAlign, flexGrow: 1 }}>{title}</Box>
        {onClose && (
          <OphButton
            startIcon={<CloseIcon />}
            aria-label={t('yleinen.sulje')}
            onClick={() => onClose({}, 'closeButtonClick')}
            sx={{
              color: ophColors.grey600,
              alignSelf: 'flex-start',
              padding: 0,
            }}
          />
        )}
      </DialogTitle>
      <DialogContent sx={{ textAlign: contentAlign, position: 'relative' }}>
        {children}
      </DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};
