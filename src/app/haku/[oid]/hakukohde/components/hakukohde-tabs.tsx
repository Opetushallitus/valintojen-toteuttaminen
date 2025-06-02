'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { DEFAULT_BOX_BORDER, ophColors, styled } from '@/lib/theme';
import { hakukohdeQueryOptions } from '@/lib/kouta/useHakukohde';
import { hakuQueryOptions } from '@/lib/kouta/useHaku';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useSuspenseQueries } from '@tanstack/react-query';
import { haunAsetuksetQueryOptions } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { userPermissionsQueryOptions } from '@/hooks/useUserPermissions';
import { notFound } from 'next/navigation';
import { HakukohdeTabLink } from '@/components/hakukohde-tab-link';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import { getVisibleTabs, isTabVisible } from '@/lib/hakukohde-tab-utils';
import { hakukohteenValinnanvaiheetQueryOptions } from '@/lib/valintaperusteet/valintaperusteet-service';
import { checkIsValintalaskentaUsed } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useOrganizationOidPath } from '@/lib/organisaatio-service';

const StyledContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 3, 0),
  borderBottom: DEFAULT_BOX_BORDER,
}));

const StyledHeader = styled('div')(({ theme }) => ({
  textAlign: 'left',
  marginBottom: theme.spacing(2),
  '& .hakukohdeLabel': {
    fontWeight: 'normal',
  },
}));

const StyledTabs = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
  flexWrap: 'wrap',
}));

const StyledTab = styled(HakukohdeTabLink)<{ $active: boolean }>(
  ({ $active }) => ({
    color: ophColors.blue2,
    cursor: 'pointer',
    borderBottom: '3px solid',
    borderColor: $active ? ophColors.blue2 : 'transparent',
    textDecoration: 'none',
    '&:hover': {
      borderColor: ophColors.blue2,
    },
    '&:focus-visible': {
      outlineOffset: '3px',
    },
  }),
);

export const HakukohdeTabs = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const activeTab = useHakukohdeTab();
  const { t, translateEntity } = useTranslations();

  const [
    { data: haku },
    { data: hakukohde },
    { data: haunAsetukset },
    { data: valinnanvaiheet },
    { data: permissions },
  ] = useSuspenseQueries({
    queries: [
      hakuQueryOptions({ hakuOid }),
      hakukohdeQueryOptions({ hakukohdeOid }),
      haunAsetuksetQueryOptions({ hakuOid }),
      hakukohteenValinnanvaiheetQueryOptions(hakukohdeOid),
      userPermissionsQueryOptions,
    ],
  });

  const usesValintalaskenta = checkIsValintalaskentaUsed(valinnanvaiheet);

  const { data: organizationOidPath } = useOrganizationOidPath(
    hakukohde.organisaatioOid,
  );

  if (
    !isTabVisible({
      tab: activeTab,
      haku,
      hakukohde,
      haunAsetukset,
      permissions,
      usesValintalaskenta,
      organizationOidPath: organizationOidPath,
    })
  ) {
    return notFound();
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <OphTypography variant="h3" component="h2">
          <span className="organisaatioLabel">
            {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
          </span>
          <br />
          <span className="hakukohdeLabel">
            {translateEntity(hakukohde.nimi)}
          </span>
        </OphTypography>
      </StyledHeader>
      <StyledTabs>
        {getVisibleTabs({
          haku,
          hakukohde,
          haunAsetukset,
          usesValintalaskenta,
          permissions,
          organizationOidPath,
        }).map((tab) => (
          <StyledTab
            key={'hakukohde-tab-' + tab.route}
            hakuOid={hakuOid}
            hakukohdeOid={hakukohdeOid}
            tabRoute={tab.route}
            $active={tab.title === activeTab.title}
          >
            {t(tab.title)}
          </StyledTab>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};
