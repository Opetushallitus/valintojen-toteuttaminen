'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { styled } from '@/app/lib/theme';
import { useHenkiloSearchResults } from '../hooks/useHenkiloSearchResults';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { ErrorView } from '@/app/components/error-view';
import Link, { LinkProps } from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { getHenkiloTitle } from '../lib/henkilo-utils';

const StyledList = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  textAlign: 'left',
  overflowY: 'auto',
  height: 'auto',
  paddingRight: theme.spacing(0.5),
  gap: theme.spacing(0.5),
}));

const SELECTED_CLASS = 'hakukohde-list--item-selected';

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
    <Link
      {...props}
      href={{
        pathname: `/haku/${hakuOid}/henkilo/${hakemusOid}`,
        query: henkiloSearchParam && { henkilosearch: henkiloSearchParam },
      }}
    >
      {children}
    </Link>
  );
};

const StyledLinkItem = styled(HenkiloLink)(({ theme }) => ({
  display: 'block',
  padding: theme.spacing(1),
  cursor: 'pointer',
  color: ophColors.blue2,
  textDecoration: 'none',
  borderRadius: '0',
  '&:nth-of-type(even)': {
    backgroundColor: ophColors.grey50,
  },
  [`&:hover, &.${SELECTED_CLASS}`]: {
    backgroundColor: ophColors.lightBlue2,
  },
  '&:focus-visible': {
    outlineOffset: '-2px',
  },
}));

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
              <StyledList tabIndex={0} aria-label={t('henkilo.navigaatio')}>
                {results?.map((henkilo) => {
                  return (
                    <StyledLinkItem
                      key={henkilo.hakijaOid}
                      className={
                        selectedHakemusOid === henkilo.hakemusOid
                          ? SELECTED_CLASS
                          : ''
                      }
                      hakuOid={hakuOid}
                      hakemusOid={henkilo.hakemusOid}
                      onClick={onItemClick}
                      tabIndex={0}
                    >
                      {getHenkiloTitle(henkilo)}
                    </StyledLinkItem>
                  );
                })}
              </StyledList>
            )}
          </>
        );
      } else {
        return <p></p>;
      }
  }
};

export default HenkiloList;
