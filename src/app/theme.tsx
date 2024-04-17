'use client';
import { createTheme } from '@mui/material/styles';
import NextLink, { LinkProps } from 'next/link';
import * as React from 'react';

const LinkBehaviour = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkBehaviour(props, ref) {
    return <NextLink ref={ref} {...props} />;
  },
);

const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehaviour,
      },
    },
  },
});

export default theme;
