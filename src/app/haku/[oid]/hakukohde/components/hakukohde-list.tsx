'use client';

import { useHakukohdeSearchResults } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/lib/localization/useTranslations';
import { Hakukohde } from '@/app/lib/kouta/kouta-types';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useParams } from 'next/navigation';
import { HakukohdeTabLink } from './hakukohde-tab-link';
import { useHakukohdeTab } from '@/app/hooks/useHakukohdeTab';
import {
  NavigationList,
  NAV_LIST_SELECTED_ITEM_CLASS,
} from '@/app/components/navigation-list';

const useSelectedHakukohdeOid = () => useParams().hakukohde;

export const HakukohdeList = ({
  hakuOid,
  onItemClick,
}: {
  hakuOid: string;
  onItemClick: () => void;
}) => {
  const { t, translateEntity } = useTranslations();
  const { results } = useHakukohdeSearchResults(hakuOid);

  const activeHakukohdeTab = useHakukohdeTab();
  const selectedHakukohdeOid = useSelectedHakukohdeOid();
  return (
    <>
      <OphTypography>
        {results.length} {t('haku.hakukohdetta')}
      </OphTypography>
      <NavigationList tabIndex={0} aria-label={t('hakukohde.navigaatio')}>
        {results?.map((hk: Hakukohde) => (
          <HakukohdeTabLink
            key={hk.oid}
            hakuOid={hakuOid}
            hakukohdeOid={hk.oid}
            tabRoute={activeHakukohdeTab.route}
            className={
              selectedHakukohdeOid === hk.oid
                ? NAV_LIST_SELECTED_ITEM_CLASS
                : ''
            }
            onClick={onItemClick}
            tabIndex={0}
          >
            <OphTypography
              title={hk.organisaatioOid}
              variant="label"
              color="inherit"
            >
              {hk.jarjestyspaikkaHierarkiaNimi
                ? translateEntity(hk.jarjestyspaikkaHierarkiaNimi)
                : ''}
            </OphTypography>
            <OphTypography title={hk.oid} color="inherit">
              {translateEntity(hk.nimi)}
            </OphTypography>
          </HakukohdeTabLink>
        ))}
      </NavigationList>
    </>
  );
};
