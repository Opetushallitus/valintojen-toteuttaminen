'use client';
import { Box, Stack, styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { PageContent } from './page-content';
import { DEFAULT_BOX_BORDER, notLarge } from '@/app/lib/theme';

const ContentWrapper = styled(PageContent)(({ theme }) => ({
  padding: theme.spacing(4),
  [notLarge(theme)]: {
    padding: theme.spacing(1, 0, 0, 0),
  },
}));

const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: ophColors.white,
  width: '100%',
  border: DEFAULT_BOX_BORDER,
  [notLarge(theme)]: {
    borderLeft: 'none',
    borderRight: 'none',
  },
}));

export const PageLayout = ({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      {header}
      <ContentWrapper>
        <BoxWrapper>{children}</BoxWrapper>
      </ContentWrapper>
    </Stack>
  );
};
