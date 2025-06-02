'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  useHasSomeOrganizationPermission,
  useUserPermissions,
} from '@/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/lib/kouta/kouta-service';
import { DEFAULT_BOX_BORDER, styled } from '@/lib/theme';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useQueries } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { onkoHaullaValintaryhma } from '@/lib/valintaperusteet/valintaperusteet-service';
import { ClientSpinner } from '@/components/client-spinner';
import { PermissionError } from '@/lib/common';
import { isEmpty, unique } from 'remeda';
import useToaster from '@/hooks/useToaster';
import { useEffect } from 'react';

const TAB_BUTTON_HEIGHT = '48px';

const StyledButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
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

  const userPermissions = useUserPermissions();
  const hasOphCRUD = userPermissions.hasOphCRUD;

  const { addToast } = useToaster();

  const [
    { data: hasValintaryhma },
    {
      data: hakukohteet,
      isLoading: isHakukohteetLoading,
      isError: isHakukohteetError,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: ['onkoHaullaValintaryhma', hakuOid],
        queryFn: () => onkoHaullaValintaryhma(hakuOid),
      },
      {
        ...getHakukohteetQueryOptions(hakuOid, userPermissions),
        enabled: !hasOphCRUD,
      },
    ],
  });

  useEffect(() => {
    if (isHakukohteetError) {
      addToast({
        key: 'virhe.hakukohteiden-lataus',
        type: 'error',
        message: t('virhe.hakukohteiden-lataus'),
      });
    }
  }, [isHakukohteetError, addToast, t]);

  const hakukohdeTarjoajaOids = unique(
    hakukohteet?.map((hk) => hk.tarjoajaOid) ?? [],
  );

  const hasValinnatRead = useHasSomeOrganizationPermission(
    hakukohdeTarjoajaOids,
    'READ',
  );
  const hasValinnatCRUD = useHasSomeOrganizationPermission(
    hakukohdeTarjoajaOids,
    'CRUD',
  );

  if (isHakukohteetError && !hasOphCRUD) {
    throw new PermissionError('virhe.hakukohteiden-lataus');
  }

  if (
    !hasOphCRUD &&
    !isHakukohteetLoading &&
    !isHakukohteetError &&
    !hasValinnatRead &&
    !isEmpty(hakukohteet ?? [])
  ) {
    throw new PermissionError('virhe.haku-ei-oikeuksia');
  }

  return (
    <Stack
      component="nav"
      direction="row"
      sx={{
        justifyContent: 'flex-start',
        width: '100%',
        borderBottom: DEFAULT_BOX_BORDER,
        height: TAB_BUTTON_HEIGHT,
      }}
      aria-label={t('haku-tabs.navigaatio')}
    >
      {!hasOphCRUD && isHakukohteetLoading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ClientSpinner size={24} sx={{ margin: 1 }} />
        </Box>
      ) : (
        <>
          {hasValinnatRead && (
            <TabButton tabName="hakukohde" hakuOid={hakuOid} />
          )}
          {hasValinnatRead && <TabButton tabName="henkilo" hakuOid={hakuOid} />}
          {hasValintaryhma && hasValinnatCRUD && (
            <TabButton tabName="valintaryhma" hakuOid={hakuOid} />
          )}
          <Box sx={{ flexGrow: 2, height: TAB_BUTTON_HEIGHT }} />
          {hasValinnatCRUD && (
            <TabButton tabName="yhteisvalinnan-hallinta" hakuOid={hakuOid} />
          )}
        </>
      )}
    </Stack>
  );
};
