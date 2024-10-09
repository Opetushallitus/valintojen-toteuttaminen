'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListTableColumn } from '@/app/components/table/table-types';
import {
  hakijaColumn,
  makeColumnWithCustomRender,
  makeColumnWithValueToTranslate,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { HakemuksenHarkinnanvaraisuus } from '../hooks/useHakinnanvaraisetHakemukset';
import { useHarkinanvaraisetPaginated } from '../hooks/useHarkinnanvaraisetPaginated';
import { LocalizedSelect } from '@/app/components/localized-select';

const TRANSLATIONS_PREFIX = 'harkinnanvaraiset.taulukko';

export const HarkinnanvaraisetTable = ({
  data,
}: {
  data: Array<HakemuksenHarkinnanvaraisuus>;
}) => {
  const { t } = useTranslations();

  const { results, sort, setSort, page, setPage, pageSize } =
    useHarkinanvaraisetPaginated(data);

  const columns: Array<ListTableColumn<HakemuksenHarkinnanvaraisuus>> = useMemo(
    () => [
      hakijaColumn,
      makeColumnWithValueToTranslate<HakemuksenHarkinnanvaraisuus>({
        t,
        title: `${TRANSLATIONS_PREFIX}.harkinnanvaraisuuden-syy`,
        key: 'harkinnanvaraisuudenSyy',
        valueProp: 'harkinnanvaraisuudenSyy',
      }),
      makeColumnWithCustomRender({
        title: `${TRANSLATIONS_PREFIX}.harkinnanvarainen-tila`,
        key: 'harkinnanvarainenTila',
        renderFn: (props) => (
          <LocalizedSelect
            sx={{ minWidth: '150px' }}
            clearable={true}
            placeholder="(tyhjä)"
            options={[
              {
                label: 'Hyväksytty',
                value: 'HYVAKSYTTY',
              },
              {
                label: 'Ei hyväksytty',
                value: 'EI_HYVAKSYTTY',
              },
            ]}
            value={props.harkinnanvarainenTila}
          />
        ),
        sortable: false,
      }),
    ],
    [t],
  );

  const [selection, setSelection] = useState<Set<string>>(() => new Set());

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
