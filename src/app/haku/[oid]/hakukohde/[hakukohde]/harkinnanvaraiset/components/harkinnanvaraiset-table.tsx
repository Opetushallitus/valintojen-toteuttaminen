'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { ListTableColumn } from '@/components/table/table-types';
import {
  createHakijaColumn,
  makeColumnWithCustomRender,
  makeColumnWithValueToTranslate,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { useHarkinanvaraisetPaginated } from '../hooks/useHarkinnanvaraisetPaginated';
import {
  HarkinnanvarainenTilaSelect,
  TRANSLATIONS_PREFIX,
} from './harkinnanvarainen-tila-select';
import {
  HakemuksenHarkinnanvaraisuus,
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisetTilatByHakemusOids,
} from '@/lib/types/harkinnanvaraiset-types';

export const HarkinnanvaraisetTable = ({
  data,
  selection,
  setSelection,
  onHarkinnanvaraisetTilatChange,
  harkinnanvaraisetTilat,
}: {
  data: Array<HakemuksenHarkinnanvaraisuus>;
  selection: Set<string>;
  setSelection: (selection: Set<string>) => void;
  onHarkinnanvaraisetTilatChange?: (
    harkinnanvaraisetTilaChanges: HarkinnanvaraisetTilatByHakemusOids,
  ) => void;
  harkinnanvaraisetTilat: Record<string, HarkinnanvarainenTilaValue>;
}) => {
  const { t } = useTranslations();

  const { results, sort, setSort, page, setPage, pageSize } =
    useHarkinanvaraisetPaginated(data);

  const columns: Array<ListTableColumn<HakemuksenHarkinnanvaraisuus>> = useMemo(
    () => [
      createHakijaColumn({}),
      makeColumnWithValueToTranslate<HakemuksenHarkinnanvaraisuus>({
        t,
        title: `${TRANSLATIONS_PREFIX}.harkinnanvaraisuuden-syy`,
        key: 'harkinnanvaraisuudenSyy',
        valueProp: 'harkinnanvaraisuudenSyy',
      }),
      makeColumnWithCustomRender({
        title: `${TRANSLATIONS_PREFIX}.harkinnanvarainen-tila`,
        key: 'harkinnanvarainenTila',
        renderFn: (props) => {
          return (
            <HarkinnanvarainenTilaSelect
              hakemusOid={props.hakemusOid}
              hakijanNimi={props.hakijanNimi}
              harkinnanvarainenTila={props.harkinnanvarainenTila}
              harkinnanvaraisetTilat={harkinnanvaraisetTilat}
              onHarkinnanvaraisetTilatChange={onHarkinnanvaraisetTilatChange}
            />
          );
        },
        sortable: false,
      }),
    ],
    [t, onHarkinnanvaraisetTilatChange, harkinnanvaraisetTilat],
  );

  return (
    <Box>
      <ListTable
        rowKeyProp="hakemusOid"
        columns={columns}
        rows={results}
        sort={sort}
        setSort={setSort}
        checkboxSelection={true}
        selection={selection}
        onSelectionChange={setSelection}
        getRowCheckboxLabel={({ hakijanNimi }) =>
          t(`${TRANSLATIONS_PREFIX}.valitse-harkinnanvarainen-hakemus`, {
            hakijanNimi,
          })
        }
        pagination={{
          page,
          setPage,
          pageSize,
        }}
      />
    </Box>
  );
};
