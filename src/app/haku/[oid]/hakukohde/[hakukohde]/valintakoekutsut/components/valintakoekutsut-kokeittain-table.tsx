'use client';
import { ValintakoekutsutActionBar } from './valintakoekutsut-action-bar';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { ValintakoeKutsuItem } from '@/lib/types/valintakoekutsut-types';
import { ListTableColumn } from '@/components/table/table-types';
import {
  createHakijaColumn,
  makeColumnWithValueToTranslate,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';

const TRANSLATIONS_PREFIX = 'valintakoekutsut.taulukko';

export const ValintakoekutsutKokeittainTable = ({
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
      createHakijaColumn({}),
      makeColumnWithValueToTranslate({
        t,
        title: `${TRANSLATIONS_PREFIX}.osallistuminen`,
        key: 'osallistuminen',
        valueProp: 'osallistuminen',
      }),
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
        render: ({ asiointiKieli }) =>
          asiointiKieli ? t(`kieli.${asiointiKieli}`) : '',
      },
    ],
    [t, translateEntity],
  );

  const [selection, setSelection] = useState<Set<string>>(() => new Set());

  return (
    <Stack spacing={1}>
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
        getRowCheckboxLabel={({ hakijanNimi }) =>
          t(`${TRANSLATIONS_PREFIX}.valitse-koekutsu-hakijalle`, {
            hakijanNimi,
          })
        }
        pagination={{
          page,
          setPage,
          pageSize,
        }}
      />
    </Stack>
  );
};
