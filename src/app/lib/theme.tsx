'use client';
import { ophColors } from '@opetushallitus/oph-design-system';
import { styled as muiStyled } from '@mui/material/styles';
import {
  CheckBoxOutlined,
  IndeterminateCheckBoxOutlined,
} from '@mui/icons-material';

export { ophColors } from '@opetushallitus/oph-design-system';

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  !propName.startsWith('$');

export const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: withTransientProps,
    ...options,
  });
};

export const THEME_OVERRIDES = {
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderColor: ophColors.grey800,
          borderRadius: '2px',
          height: '48px',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          '&:hover, &:focus': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        checkedIcon: <CheckBoxOutlined />,
        indeterminateIcon: <IndeterminateCheckBoxOutlined />,
      },
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paper: ({ theme }: any) => ({
          minHeight: '200px',
          borderTop: `4px solid ${ophColors.cyan1}`,
          borderRadius: '2px',
          boxShadow: '2px 2px 8px 0px rgba(0,0,0,0.17)',
          padding: theme.spacing(3),
        }),
      },
    },
    MuiDialogTitle: {
      defaultProps: {
        variant: 'h2',
      },
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: ({ theme }: any) => ({
          padding: theme.spacing(0, 0, 2, 0),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        root: ({ theme }: any) => ({
          padding: theme.spacing(2, 0, 0, 0),
        }),
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        size: 50,
        thickness: 4.5,
      },
    },
  },
};
