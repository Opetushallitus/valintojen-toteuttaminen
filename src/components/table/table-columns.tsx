import { KeysMatching, ListTableColumn } from './table-types';
import { ExternalLink } from '../external-link';
import { ophColors } from '@opetushallitus/oph-design-system';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { TFunction } from '@/lib/localization/useTranslations';
import { isNullish } from 'remeda';

export const makeGenericColumn = <T extends Record<string, unknown>>({
  title,
  key,
  valueProp,
  style = {},
}: {
  title: string;
  key: string;
  valueProp: KeysMatching<T, string | number | undefined>;
  style?: React.CSSProperties;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{props[valueProp] as string}</span>,
  style: { width: 'auto', ...style },
});

export const makeColumnWithCustomRender = <T extends Record<string, unknown>>({
  title,
  key,
  renderFn,
  sortable = true,
}: {
  title: string;
  key: string;
  renderFn: (props: T) => React.ReactNode;
  sortable?: boolean;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => renderFn(props),
  sortable,
});

export const makeBooleanYesNoColumn = <T extends Record<string, unknown>>({
  t,
  title,
  key,
  booleanValueProp,
}: {
  t: TFunction;
  title: string;
  key: string;
  booleanValueProp: KeysMatching<T, boolean>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => (
    <span>
      {(props[booleanValueProp] as boolean)
        ? t('yleinen.kylla')
        : t('yleinen.ei')}
    </span>
  ),
  style: { width: 'auto' },
});

export const makeColumnWithValueToTranslate = <
  T extends Record<string, unknown>,
>({
  t,
  title,
  key,
  valueProp,
}: {
  t: TFunction;
  title: string;
  key: string;
  valueProp: KeysMatching<T, string | undefined>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{t(props[valueProp] as string)}</span>,
  style: { width: 'auto' },
});

export const makeCountColumn = <T extends Record<string, unknown>>({
  title,
  key,
  amountProp,
  style = {},
}: {
  title: string;
  key: string;
  amountProp: KeysMatching<T, number | string | undefined>;
  style?: React.CSSProperties;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{(props[amountProp] as number) ?? ''}</span>,
  style: { width: 0, ...style },
});

export const makeExternalLinkColumn = <T extends Record<string, unknown>>({
  linkBuilder,
  title,
  key,
  linkName,
  nameProp,
  linkProp,
  style = {},
}: {
  linkBuilder: (s: string) => string;
  title: string;
  key: string;
  linkName?: string;
  nameProp?: KeysMatching<T, string>;
  linkProp: KeysMatching<T, string | unknown>;
  style?: React.CSSProperties;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) =>
    isNullish(props[linkProp]) ? null : (
      <ExternalLink
        noIcon={true}
        name={linkName ?? (props[nameProp ?? linkProp] as string)}
        href={linkBuilder(props[linkProp] as string)}
      />
    ),
  style: { width: 'auto', ...style },
});

export const buildLinkToPerson = (personOid: string) =>
  `henkilo-ui/oppija/${personOid}?permissionCheckService=ATARU`;

type HakijaColumnType = {
  hakijanNimi: string;
  hakemusOid: string;
  hakijaOid: string;
};

export enum HakijaColumnLinkType {
  HAKEMUS = 'hakemusOid',
  HAKIJA = 'hakijaOid',
}

export const createHakijaColumn = ({
  hakijaLinkType = HakijaColumnLinkType.HAKEMUS,
}: {
  hakijaLinkType?: HakijaColumnLinkType;
}) =>
  makeExternalLinkColumn<HakijaColumnType>({
    linkBuilder:
      hakijaLinkType === HakijaColumnLinkType.HAKEMUS
        ? buildLinkToApplication
        : buildLinkToPerson,
    title: 'hakeneet.taulukko.hakija',
    key: 'hakijanNimi',
    nameProp: 'hakijanNimi',
    linkProp: hakijaLinkType,
  });

const stickyColumnStyle: React.CSSProperties = {
  minWidth: '260px',
  position: 'sticky',
  left: 0,
  boxShadow: `0 5px 3px 2px ${ophColors.grey200}`,
  zIndex: 1,
  backgroundColor: ophColors.white,
};

export const createStickyHakijaColumn = (t: TFunction) =>
  Object.assign(createHakijaColumn({}), {
    style: stickyColumnStyle,
    title: t('hakeneet.taulukko.hakija'),
  });
