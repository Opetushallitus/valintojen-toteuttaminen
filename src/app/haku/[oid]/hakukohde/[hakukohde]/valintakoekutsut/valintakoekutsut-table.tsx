'use client';
import ListTable, {
  makeExternalLinkColumn,
  ListTableColumn,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ValintakoeKutsuItem } from '@/app/hooks/useValintakoekutsut';
import { useMemo } from 'react';
import { prop } from 'remeda';

const TRANSLATIONS_PREFIX = 'valintakoekutsut.taulukko';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

const hakijaColumn = makeExternalLinkColumn<ValintakoeKutsuItem>({
  linkBuilder: buildLinkToPerson,
  title: `${TRANSLATIONS_PREFIX}.hakija`,
  key: 'hakijanNimi',
  nameProp: 'hakijanNimi',
  linkProp: 'henkiloOid',
});

export const ValintakoekutsutTable = ({
  data,
  sort,
  setSort,
  page,
  setPage,
  pageSize,
}: {
  valintakoeTunniste: string;
  data: Array<ValintakoeKutsuItem>;
  sort: string;
  setSort: (sort: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}) => {
  const { t, translateEntity } = useTranslations();

  const columns: Array<ListTableColumn<ValintakoeKutsuItem>> = useMemo(
    () => [
      hakijaColumn,
      {
        title: `${TRANSLATIONS_PREFIX}.osallistuminen`,
        key: 'osallistuminen',
        render: ({ osallistuminen }) => (
          <span>{t(`osallistuminen.${osallistuminen}`)}</span>
        ),
      },
      {
        title: `${TRANSLATIONS_PREFIX}.lisatietoja`,
        key: 'lisatietoja',
        render: (props) => <span>{translateEntity(props.lisatietoja)}</span>,
      },
      {
        title: `${TRANSLATIONS_PREFIX}.laskettuPvm`,
        key: 'laskettuPvm',
        render: prop('laskettuPvm'),
      },
      {
        title: `${TRANSLATIONS_PREFIX}.asiointiKieli`,
        key: 'asiointiKieli',
        render: ({ asiointiKieli }) => t(`kieli.${asiointiKieli}`),
      },
    ],
    [t, translateEntity],
  );

  return (
    <ListTable
      rowKeyProp="hakijaOid"
      columns={columns}
      rows={data}
      sort={sort}
      setSort={setSort}
      pagination={{
        page,
        setPage,
        pageSize,
      }}
    />
  );
};
