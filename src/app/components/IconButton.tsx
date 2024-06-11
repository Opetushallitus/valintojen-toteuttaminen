import { ButtonProps, Button as MuiButton } from '@mui/material';
import { forwardRef } from 'react';

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function IconButton(props, ref) {
    return (
      <MuiButton
        {...props}
        ref={ref}
        sx={
          props.children
            ? {}
            : {
                '&.MuiButton-root': {
                  padding: 0.5,
                  margin: 0,
                  minWidth: 0,
                  flexShrink: 0,
                },
                '& .MuiButton-startIcon': {
                  margin: 0,
                },
              }
        }
      />
    );
  },
);
