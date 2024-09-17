'use client';
import { ValintakoekutsutActionBar } from '@/app/components/valintakoekutsut-action-bar';
import ListTable, {
  makeExternalLinkColumn,
  ListTableColumn,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ValintakoeKutsuItem } from '@/app/hooks/useValintakoekutsut';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';

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
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  data,
  sort,
  setSort,
  page,
  setPage,
  pageSize,
}: {
  hakuOid: string;
  hakukohdeOid: string;
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
        render: ({ laskettuPvm }) => toFormattedDateTimeString(laskettuPvm),
      },
      {
        title: `${TRANSLATIONS_PREFIX}.asiointiKieli`,
        key: 'asiointiKieli',
        render: ({ asiointiKieli }) => t(`kieli.${asiointiKieli}`),
      },
    ],
    [t, translateEntity],
  );

  const [selection, setSelection] = useState<Set<string>>(() => new Set());

  return (
    <Box>
      <ValintakoekutsutActionBar
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        valintakoeTunniste={valintakoeTunniste}
        selection={selection}
        resetSelection={() => setSelection(new Set())}
      />
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={data}
        sort={sort}
        setSort={setSort}
        checkboxSelection={true}
        selection={selection}
        onSelectionChange={setSelection}
        pagination={{
          page,
          setPage,
          pageSize,
        }}
      />
    </Box>
  );
};
