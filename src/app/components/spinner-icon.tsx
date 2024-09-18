'use client';
import { withDefaultProps } from '../lib/mui-utils';
import { ClientSpinner } from './client-spinner';

export const SpinnerIcon = withDefaultProps(ClientSpinner, {
  color: 'inherit',
  size: '24px',
});
