'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  useHasAnyOrgPermission,
  useUserPermissions,
} from '@/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/lib/kouta/kouta-service';
import { DEFAULT_BOX_BORDER, styled } from '@/lib/theme';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { onkoHaullaValintaryhma } from '@/lib/valintaperusteet/valintaperusteet-service';

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
  const userPermissions = useUserPermissions();

  queryClient.prefetchQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

  const [{ data: hasValintaryhma }] = useQueries({
    queries: [
      {
        queryKey: ['onkoHaullaValintaryhma', hakuOid],
        queryFn: () => onkoHaullaValintaryhma(hakuOid),
      },
    ],
  });

  const hasValinnatCRUD = useHasAnyOrgPermission('CRUD');

  const hasValinnatRead = useHasAnyOrgPermission('READ');

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
      {hasValinnatRead && <TabButton tabName="hakukohde" hakuOid={hakuOid} />}
      {hasValinnatRead && <TabButton tabName="henkilo" hakuOid={hakuOid} />}
      {hasValintaryhma && hasValinnatCRUD && (
        <TabButton tabName="valintaryhma" hakuOid={hakuOid} />
      )}
      <Box sx={{ flexGrow: 2 }}></Box>
      {hasValinnatCRUD && (
        <TabButton tabName="yhteisvalinnan-hallinta" hakuOid={hakuOid} />
      )}
    </Stack>
  );
};
