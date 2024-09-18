import { TFunction } from 'i18next';
import { KeysMatching, ListTableColumn } from './table-types';
import { ExternalLink } from '../external-link';

export const makeGenericColumn = <T extends Record<string, unknown>>({
  title,
  key,
  valueProp,
}: {
  title: string;
  key: string;
  valueProp: KeysMatching<T, string | number | undefined>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{props[valueProp] as string}</span>,
  style: { width: 'auto' },
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
  valueProp: KeysMatching<T, string>;
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
}: {
  title: string;
  key: string;
  amountProp: KeysMatching<T, number>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => <span>{(props[amountProp] ?? 0) as number}</span>,
  style: { width: 0 },
});

export const makeExternalLinkColumn = <T extends Record<string, unknown>>({
  linkBuilder,
  title,
  key,
  nameProp,
  linkProp,
}: {
  linkBuilder: (s: string) => string;
  title: string;
  key: string;
  nameProp?: KeysMatching<T, string>;
  linkProp: KeysMatching<T, string>;
}): ListTableColumn<T> => ({
  title,
  key,
  render: (props) => (
    <ExternalLink
      noIcon={true}
      name={props[nameProp ?? linkProp] as string}
      href={linkBuilder(props[linkProp] as string)}
    />
  ),
  style: { width: 'auto' },
});

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

export const buildLinkToPerson = (personOid: string) =>
  LINK_TO_PERSON + personOid;

type HakijaColumnType = {
  hakijanNimi: string;
  hakijaOid: string;
};

export const hakijaColumn = makeExternalLinkColumn<HakijaColumnType>({
  linkBuilder: buildLinkToPerson,
  title: 'hakeneet.taulukko.hakija',
  key: 'hakijanNimi',
  nameProp: 'hakijanNimi',
  linkProp: 'hakijaOid',
});
