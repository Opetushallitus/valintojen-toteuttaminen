'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { ophColors, styled } from '@/app/lib/theme';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { hakukohdeQueryOptions } from '@/app/hooks/useHakukohde';
import { hakuQueryOptions } from '@/app/hooks/useHaku';
import {
  getVisibleTabs,
  isTabVisible,
} from '@/app/haku/[oid]/lib/hakukohde-tab-utils';
import { useHakukohdeTab } from '@/app/haku/[oid]/hooks/useHakukohdeTab';
import { HakukohdeTabLink } from '@/app/haku/[oid]/components/hakukohde-tab-link';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useSuspenseQueries } from '@tanstack/react-query';
import { haunAsetuksetQueryOptions } from '@/app/hooks/useHaunAsetukset';
import { getUsesValintalaskenta } from '@/app/lib/valintalaskentakoostepalvelu';
import { userPermissionsQueryOptions } from '@/app/hooks/useUserPermissions';
import { notFound } from 'next/navigation';

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
    '&:hover,&:focus': {
      borderColor: ophColors.blue2,
    },
  }),
);

const HakukohdeTabs = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const activeTab = useHakukohdeTab();
  const { t, translateEntity } = useTranslations();

  const [
    hakuQuery,
    hakukohdeQuery,
    haunAsetuksetQuery,
    usesValintalaskentaQuery,
    permissionsQuery,
  ] = useSuspenseQueries({
    queries: [
      hakuQueryOptions({ hakuOid }),
      hakukohdeQueryOptions({ hakukohdeOid }),
      haunAsetuksetQueryOptions({ hakuOid }),
      {
        queryKey: ['getUsesValintalaskenta', hakukohdeOid],
        queryFn: () => getUsesValintalaskenta({ hakukohdeOid }),
      },
      userPermissionsQueryOptions,
    ],
  });

  const { data: haku } = hakuQuery;
  const { data: hakukohde } = hakukohdeQuery;
  const { data: haunAsetukset } = haunAsetuksetQuery;
  const { data: usesValintalaskenta } = usesValintalaskentaQuery;
  const { data: permissions } = permissionsQuery;

  if (
    !isTabVisible({
      tab: activeTab,
      haku,
      hakukohde,
      haunAsetukset,
      permissions,
      usesValintalaskenta,
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

export default HakukohdeTabs;
