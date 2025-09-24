'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useParams } from 'next/navigation';
import { NAV_LIST_SELECTED_ITEM_CLASS } from '@/components/navigation-list';
import { useValintaryhmaSearchResults } from '../hooks/useValintaryhmaSearch';
import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';
import { ValintaryhmaAccordion } from './valintaryhma-accordion';
import { ValintaryhmaLink } from './valintaryhma-link';
import { styled } from '@/lib/theme';
import { hasPermissionToValintaryhmaOrAlaValintaryhma } from '../lib/valintaryhma-util';

const useSelectedValintaryhmaOid = () => useParams().valintaryhma;

const ValintaryhmaNavigationList = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  textAlign: 'left',
  overflowY: 'auto',
  height: 'auto',
  paddingRight: theme.spacing(0.5),
  gap: theme.spacing(0.5),
  [`.zepra:nth-child(even)`]: {
    backgroundColor: ophColors.grey50,
  },
  a: {
    display: 'block',
    padding: theme.spacing(1),
    cursor: 'pointer',
    color: ophColors.blue2,
    textDecoration: 'none',
    borderRadius: '0',
    [`&.${NAV_LIST_SELECTED_ITEM_CLASS}`]: {
      backgroundColor: ophColors.lightBlue2,
    },
    '&:hover': {
      backgroundColor: ophColors.lightBlue2,
    },
    '&:focus-visible': {
      outlineOffset: '-2px',
    },
  },
}));

const Content = ({
  valintaryhma,
  hakuOid,
  visibleValintaryhmat,
  onItemClick,
}: {
  valintaryhma: ValintaryhmaHakukohteilla;
  hakuOid: string;
  visibleValintaryhmat: Array<string>;
  onItemClick?: () => void;
}) => {
  const { t } = useTranslations();

  const selectedValintaryhmaOid = useSelectedValintaryhmaOid();

  const key =
    valintaryhma.alaValintaryhmat.length > 0
      ? `${valintaryhma.oid}-valintaryhma-accordion`
      : valintaryhma.oid;

  const selectedClassName =
    selectedValintaryhmaOid === valintaryhma.oid
      ? NAV_LIST_SELECTED_ITEM_CLASS
      : '';

  const alaValintaryhmatUserHasPermission =
    valintaryhma.alaValintaryhmat.filter(
      hasPermissionToValintaryhmaOrAlaValintaryhma,
    );

  return alaValintaryhmatUserHasPermission.length > 0 ? (
    <ValintaryhmaAccordion
      title={
        <ValintaryhmaLink
          key={key}
          hakuOid={hakuOid}
          valintaryhmaOid={valintaryhma.oid}
          onClick={onItemClick}
          tabIndex={0}
          className={selectedClassName}
          disabled={!valintaryhma.userHasWriteAccess}
        >
          <OphTypography title={valintaryhma.nimi} color="inherit">
            {valintaryhma.nimi}
          </OphTypography>
        </ValintaryhmaLink>
      }
      className="zepra"
    >
      <ValintaryhmaNavigationList
        tabIndex={0}
        aria-label={t('valintaryhma.navigaatio')}
        sx={{ paddingRight: 0 }}
      >
        {alaValintaryhmatUserHasPermission
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
      </ValintaryhmaNavigationList>
    </ValintaryhmaAccordion>
  ) : (
    <ValintaryhmaLink
      key={key}
      hakuOid={hakuOid}
      valintaryhmaOid={valintaryhma.oid}
      className={`${selectedClassName} zepra`}
      onClick={onItemClick}
      tabIndex={0}
      disabled={!valintaryhma.userHasWriteAccess}
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
  const { results, ryhmat } = useValintaryhmaSearchResults(hakuOid);

  const topResults = results.filter(
    (r) =>
      r.parentOid === null && hasPermissionToValintaryhmaOrAlaValintaryhma(r),
  );

  const selectedValintaryhmaOid = useSelectedValintaryhmaOid();

  return (
    <>
      <OphTypography>
        {t('valintaryhmittain.valintaryhma-maara', {
          count: results.length + (ryhmat.hakuRyhma ? 1 : 0),
        })}
      </OphTypography>
      <ValintaryhmaNavigationList
        tabIndex={0}
        aria-label={t('valintaryhmittain.navigaatio')}
      >
        {ryhmat?.hakuRyhma && (
          <ValintaryhmaLink
            hakuOid={hakuOid}
            valintaryhmaOid={ryhmat.hakuRyhma.oid}
            tabIndex={0}
            disabled={!ryhmat?.hakuRyhma.userHasWriteAccess}
            className={`${
              selectedValintaryhmaOid === ryhmat.hakuRyhma.oid
                ? NAV_LIST_SELECTED_ITEM_CLASS
                : ''
            } zepra`}
          >
            <OphTypography title={ryhmat.hakuRyhma.nimi} color="inherit">
              {t('valintaryhmittain.haun-ryhma')}
            </OphTypography>
          </ValintaryhmaLink>
        )}
        {topResults?.map((vr: ValintaryhmaHakukohteilla) => (
          <Content
            key={vr.oid}
            valintaryhma={vr}
            hakuOid={hakuOid}
            visibleValintaryhmat={results.map((r) => r.oid)}
            onItemClick={onItemClick}
          />
        ))}
      </ValintaryhmaNavigationList>
    </>
  );
};
