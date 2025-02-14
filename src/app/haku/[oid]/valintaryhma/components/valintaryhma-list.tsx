'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { OphTypography } from '@opetushallitus/oph-design-system';
import Link, { LinkProps } from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  NAV_LIST_SELECTED_ITEM_CLASS,
  NavigationList,
} from '@/app/components/navigation-list';
import { useValintaryhmaSearchResults } from '../hooks/useValintaryhmaSearch';
import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';

export const ValintaryhmaLink = ({
  hakuOid,
  valintaryhmaOid,
  children,
  ...props
}: Omit<LinkProps, 'href'> & {
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  hakuOid: string;
  valintaryhmaOid: string;
}) => {
  const searchParams = useSearchParams();
  const vrSearchParam = searchParams.get('vrsearch');

  return (
    <Link
      {...props}
      href={{
        pathname: `/haku/${hakuOid}/valintaryhma/${valintaryhmaOid}`,
        query: vrSearchParam && { vrsearch: vrSearchParam },
      }}
    >
      {children}
    </Link>
  );
};

const useSelectedValintaryhmaOid = () => useParams().valintaryhmaOid;

export const ValintaryhmaList = ({
  hakuOid,
  onItemClick,
}: {
  hakuOid: string;
  onItemClick?: () => void;
}) => {
  const { t } = useTranslations();
  const { results } = useValintaryhmaSearchResults(hakuOid);

  const selectedValintaryhmaOid = useSelectedValintaryhmaOid();

  return (
    <>
      <OphTypography>
        {results.length} {t('valintaryhma.maara')}
      </OphTypography>
      <NavigationList tabIndex={0} aria-label={t('valintaryhma.navigaatio')}>
        {results?.map((vr: ValintaryhmaHakukohteilla) => (
          <ValintaryhmaLink
            key={vr.oid}
            hakuOid={hakuOid}
            valintaryhmaOid={vr.oid}
            className={
              selectedValintaryhmaOid === vr.oid
                ? NAV_LIST_SELECTED_ITEM_CLASS
                : ''
            }
            onClick={onItemClick}
            tabIndex={0}
          >
            <OphTypography title={vr.nimi} color="inherit">
              {(vr.nimi)}
            </OphTypography>
          </ValintaryhmaLink>
        ))}
      </NavigationList>
    </>
  );
};
