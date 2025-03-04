import { ophColors, styled } from '../lib/theme';

export const FormBox = styled('form')(({ theme }) => ({
  border: `1px solid ${ophColors.grey100}`,
  padding: theme.spacing(2.5),
  width: '100%',
}));
