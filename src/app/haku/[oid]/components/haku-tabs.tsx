'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  useHierarchyUserPermissions,
  useUserPermissions,
} from '@/hooks/useUserPermissions';
import { DEFAULT_BOX_BORDER, styled } from '@/lib/theme';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useQueries } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { onkoHaullaValintaryhma } from '@/lib/valintaperusteet/valintaperusteet-service';
import { ClientSpinner } from '@/components/client-spinner';
import { OphErrorWithTitle, PermissionError } from '@/lib/common';
import { isEmpty, unique } from 'remeda';
import useToaster from '@/hooks/useToaster';
import React, { useEffect } from 'react';
import { getVisibleHakuTabs } from '../lib/getVisibleHakuTabs';
import { checkHasPermission } from '@/lib/permissions';
import { queryOptionsGetHakukohteet } from '@/lib/kouta/kouta-queries';

const TAB_BUTTON_HEIGHT = '48px';

const StyledButton = styled(OphButton)({
  borderRadius: 0,
  fontWeight: 'normal',
  height: TAB_BUTTON_HEIGHT,
  '&:hover': {
    borderColor: ophColors.blue2,
  },
});

const useActiveHakuTabName = () => {
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
  const activeTabName = useActiveHakuTabName();

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
  const hasOphCRUD = userPermissions?.hasOphCRUD;

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
        enabled: userPermissions.writeOrganizations.length > 0,
      },
      {
        ...queryOptionsGetHakukohteet(hakuOid, userPermissions),
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

  const hierarchyPermissions = useHierarchyUserPermissions(userPermissions);

  const hasValinnatRead = checkHasPermission(
    hakukohdeTarjoajaOids,
    hierarchyPermissions,
    'READ',
  );

  if (!hasOphCRUD && !isHakukohteetLoading && !isHakukohteetError) {
    if (isEmpty(hakukohteet ?? [])) {
      throw new OphErrorWithTitle(
        'virhe.haku-ei-hakukohteita-otsikko',
        'virhe.haku-ei-hakukohteita-teksti',
      );
    } else if (!hasValinnatRead && !isEmpty(hakukohteet ?? [])) {
      throw new PermissionError('virhe.haku-ei-oikeuksia');
    }
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
        getVisibleHakuTabs({
          hierarchyPermissions,
          tarjoajaOids: hakukohdeTarjoajaOids,
          hasValintaryhma: hasValintaryhma,
        }).map((tabName) => {
          return (
            <React.Fragment key={tabName}>
              {tabName === 'yhteisvalinnan-hallinta' && (
                <Box sx={{ flexGrow: 1 }} />
              )}
              <TabButton hakuOid={hakuOid} tabName={tabName} />
            </React.Fragment>
          );
        })
      )}
    </Stack>
  );
};
