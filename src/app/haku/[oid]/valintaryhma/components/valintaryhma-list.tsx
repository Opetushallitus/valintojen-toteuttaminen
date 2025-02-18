'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import Link, { LinkProps } from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  NAV_LIST_SELECTED_ITEM_CLASS,
  NavigationList,
} from '@/app/components/navigation-list';
import { useValintaryhmaSearchResults } from '../hooks/useValintaryhmaSearch';
import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';
import { styled } from '@/app/lib/theme';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const StyledAccordionSummary = styled(AccordionSummary)(({theme}) => ({
  paddingLeft: 0,
}));

const StyledAccordionDetails = styled(AccordionDetails)(({theme}) => ({
  padding: 0,
  paddingLeft: theme.spacing(2),
  '&::before': {
    display: 'none',
  }
}));

const ValintaryhmaLink = ({
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
      style={{ textDecoration: 'none', paddingLeft: 0 }}
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

const ValintaryhmaAccordion = ({ valintaryhma, hakuOid, visibleValintaryhmat, onItemClick }: { valintaryhma: ValintaryhmaHakukohteilla, hakuOid: string, visibleValintaryhmat: string[], onItemClick?: () => void }) => {

  const { t } = useTranslations();
  const selectedValintaryhmaOid = useSelectedValintaryhmaOid();
  const key = valintaryhma.alaValintaryhmat.length > 0 ? `${valintaryhma.oid}-valintaryhma-accordion` : valintaryhma.oid;

  return valintaryhma.alaValintaryhmat.length > 0 ? (
    <Accordion
      defaultExpanded={true}
      sx={{'&::before': {display: 'none'}}}
    >
      <StyledAccordionSummary expandIcon={<ExpandMore />}>
        <ValintaryhmaLink
          key={key}
          hakuOid={hakuOid}
          valintaryhmaOid={valintaryhma.oid}
          className={
            selectedValintaryhmaOid === valintaryhma.oid
              ? NAV_LIST_SELECTED_ITEM_CLASS
              : ''
          }
          onClick={onItemClick}
          tabIndex={0}
        >
          <OphTypography title={valintaryhma.nimi} color="inherit">
            {(valintaryhma.nimi)}
          </OphTypography>
        </ValintaryhmaLink>
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        <NavigationList tabIndex={0} aria-label={t('valintaryhma.navigaatio')}>
          {valintaryhma.alaValintaryhmat.filter(vr => visibleValintaryhmat.includes(vr.oid)).map((vr: ValintaryhmaHakukohteilla) => 
            (<ValintaryhmaAccordion key={vr.oid} valintaryhma={vr} hakuOid={hakuOid} visibleValintaryhmat={visibleValintaryhmat} onItemClick={onItemClick}/>))}
        </NavigationList>
      </StyledAccordionDetails>
    </Accordion>
  ):  (<ValintaryhmaLink
    key={key}
    hakuOid={hakuOid}
    valintaryhmaOid={valintaryhma.oid}
    className={
      selectedValintaryhmaOid === valintaryhma.oid
        ? NAV_LIST_SELECTED_ITEM_CLASS
        : ''
    }
    onClick={onItemClick}
    tabIndex={0}
  >
    <OphTypography title={valintaryhma.nimi} color="inherit">
      {(valintaryhma.nimi)}
    </OphTypography>
  </ValintaryhmaLink>)
}



export const ValintaryhmaList = ({
  hakuOid,
  onItemClick,
}: {
  hakuOid: string;
  onItemClick?: () => void;
}) => {
  const { t } = useTranslations();
  const { results } = useValintaryhmaSearchResults(hakuOid);
  const topResults = results.filter(r => r.parentOid === null);

  return (
    <>
      <OphTypography>
        {results.length} {t('valintaryhma.maara')}
      </OphTypography>
      <NavigationList tabIndex={0} aria-label={t('valintaryhma.navigaatio')}>
        {topResults?.map((vr: ValintaryhmaHakukohteilla) => (
          <ValintaryhmaAccordion key={vr.oid} valintaryhma={vr} hakuOid={hakuOid} visibleValintaryhmat={results.map(r => r.oid)} onItemClick={onItemClick}/>
        ))}
      </NavigationList>
    </>
  );
};
