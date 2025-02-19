'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useParams } from 'next/navigation';
import {
  NAV_LIST_SELECTED_ITEM_CLASS,
  NavigationList,
} from '@/app/components/navigation-list';
import { useValintaryhmaSearchResults } from '../hooks/useValintaryhmaSearch';
import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';
import { ValintaryhmaAccordion } from './valintaryhma-accordion';
import { ValintaryhmaLink } from './valintaryhma-link';

const useSelectedValintaryhmaOid = () => useParams().valintaryhmaOid;

const Content = ({
  valintaryhma,
  hakuOid,
  visibleValintaryhmat,
  onItemClick,
}: {
  valintaryhma: ValintaryhmaHakukohteilla;
  hakuOid: string;
  visibleValintaryhmat: string[];
  onItemClick?: () => void;
}) => {
  const { t } = useTranslations();
  const selectedValintaryhmaOid = useSelectedValintaryhmaOid();
  const key =
    valintaryhma.alaValintaryhmat.length > 0
      ? `${valintaryhma.oid}-valintaryhma-accordion`
      : valintaryhma.oid;

  return valintaryhma.alaValintaryhmat.length > 0 ? (
    <ValintaryhmaAccordion
      title={
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
            {valintaryhma.nimi}
          </OphTypography>
        </ValintaryhmaLink>
      }
    >
      <NavigationList tabIndex={0} aria-label={t('valintaryhma.navigaatio')}>
        {valintaryhma.alaValintaryhmat
          .filter((vr) => visibleValintaryhmat.includes(vr.oid))
          .map((vr: ValintaryhmaHakukohteilla) => (
            <Content
              key={vr.oid}
              valintaryhma={vr}
              hakuOid={hakuOid}
              visibleValintaryhmat={visibleValintaryhmat}
              onItemClick={onItemClick}
            />
          ))}
      </NavigationList>
    </ValintaryhmaAccordion>
  ) : (
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
        {valintaryhma.nimi}
      </OphTypography>
    </ValintaryhmaLink>
  );
};

export const ValintaryhmaList = ({
  hakuOid,
  onItemClick,
}: {
  hakuOid: string;
  onItemClick?: () => void;
}) => {
  const { t } = useTranslations();
  const { results } = useValintaryhmaSearchResults(hakuOid);
  const topResults = results.filter((r) => r.parentOid === null);

  return (
    <>
      <OphTypography>
        {results.length} {t('valintaryhma.maara')}
      </OphTypography>
      <NavigationList tabIndex={0} aria-label={t('valintaryhma.navigaatio')}>
        {topResults?.map((vr: ValintaryhmaHakukohteilla) => (
          <Content
            key={vr.oid}
            valintaryhma={vr}
            hakuOid={hakuOid}
            visibleValintaryhmat={results.map((r) => r.oid)}
            onItemClick={onItemClick}
          />
        ))}
      </NavigationList>
    </>
  );
};
