'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { styled } from '@/app/lib/theme';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { usePathname } from 'next/navigation';

const StyledButton = styled(OphButton)({
  fontWeight: 'normal',
  height: '48px',
  '&:hover': {
    borderColor: ophColors.blue2,
  },
});

const useHakuTabName = () => {
  const pathName = usePathname();
  return pathName.split('/')[3];
};

const TabButton = ({
  hakuOid,
  tabName,
}: {
  hakuOid: string;
  tabName: string;
}) => {
  const { t } = useTranslations();
  const activeTabName = useHakuTabName();

  return (
    <StyledButton
      variant={activeTabName === tabName ? 'contained' : 'text'}
      href={`/haku/${hakuOid}/${tabName}`}
    >
      {t(`haku-tabs.${tabName}`)}
    </StyledButton>
  );
};

export const HakuTabs = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();
  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        justifyContent: 'flex-start',
        width: '100%',
        borderBottom: DEFAULT_BOX_BORDER,
      }}
      aria-label={t('haku-tabs.navigaatio')}
    >
      <TabButton tabName="hakukohde" hakuOid={hakuOid} />
      <TabButton tabName="henkilo" hakuOid={hakuOid} />
      <TabButton tabName="valintaryhma" hakuOid={hakuOid} />
      <Box sx={{ flexGrow: 2 }}></Box>
      <TabButton tabName="yhteisvalinnan-hallinta" hakuOid={hakuOid} />
    </Stack>
  );
};