'use client';
import { useTranslations } from '@/app/lib/localization/useTranslations';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta/kouta-service';
import { DEFAULT_BOX_BORDER, styled } from '@/app/lib/theme';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

const StyledButton = styled(OphButton)({
  borderRadius: 0,
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
  const queryClient = useQueryClient();
  const { data: userPermissions } = useUserPermissions();
  queryClient.prefetchQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

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
