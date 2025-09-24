'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useHenkiloSearchResults } from '../hooks/useHenkiloSearch';
import { FullClientSpinner } from '@/components/client-spinner';
import { ErrorView } from '@/components/error-view';
import { LinkProps } from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { getHenkiloTitle } from '@/lib/henkilo-utils';
import {
  NAV_LIST_SELECTED_ITEM_CLASS,
  NavigationList,
} from '@/components/navigation-list';
import { InternalLink } from '@/components/internal-link';

export const HenkiloLink = ({
  hakuOid,
  hakemusOid,
  children,
  ...props
}: Omit<LinkProps, 'href'> & {
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  hakuOid: string;
  hakemusOid: string;
}) => {
  const searchParams = useSearchParams();
  const henkiloSearchParam = searchParams.get('henkilosearch');

  return (
    <InternalLink
      {...props}
      href={{
        pathname: `/haku/${hakuOid}/henkilo/${hakemusOid}`,
        query: henkiloSearchParam && { henkilosearch: henkiloSearchParam },
      }}
    >
      {children}
    </InternalLink>
  );
};

const useSelectedHakemusOid = () => useParams().hakemusOid;

export const HenkiloList = ({
  hakuOid,
  onItemClick,
}: {
  hakuOid: string;
  onItemClick?: () => void;
}) => {
  const { t } = useTranslations();
  const {
    data: results,
    isLoading,
    isError,
    refetch,
    error,
  } = useHenkiloSearchResults({ hakuOid });

  const selectedHakemusOid = useSelectedHakemusOid();

  switch (true) {
    case isLoading:
      return <FullClientSpinner />;
    case isError:
      return <ErrorView reset={refetch} error={error} />;
    default:
      if (results) {
        return (
          <>
            <OphTypography>
              {t('henkilo.henkilo-maara', { count: results.length })}
            </OphTypography>
            {results.length > 0 && (
              <NavigationList tabIndex={0} aria-label={t('henkilo.navigaatio')}>
                {results?.map((henkilo) => {
                  return (
                    <HenkiloLink
                      key={henkilo.hakijaOid}
                      className={
                        selectedHakemusOid === henkilo.hakemusOid
                          ? NAV_LIST_SELECTED_ITEM_CLASS
                          : ''
                      }
                      hakuOid={hakuOid}
                      hakemusOid={henkilo.hakemusOid}
                      onClick={onItemClick}
                      tabIndex={0}
                    >
                      {getHenkiloTitle(henkilo)}
                    </HenkiloLink>
                  );
                })}
              </NavigationList>
            )}
          </>
        );
      } else {
        return null;
      }
  }
};
