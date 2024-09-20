import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

export type OphModalDialogProps = {
  open: boolean;
  titleAlign?: 'center' | 'left';
  contentAlign?: 'center' | 'left';
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
};

export const OphModalDialog = ({
  open,
  titleAlign = 'left',
  contentAlign = 'left',
  children,
  actions,
  title,
}: OphModalDialogProps) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <DialogTitle sx={{ textAlign: titleAlign }} id="responsive-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent sx={{ textAlign: contentAlign }}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};
