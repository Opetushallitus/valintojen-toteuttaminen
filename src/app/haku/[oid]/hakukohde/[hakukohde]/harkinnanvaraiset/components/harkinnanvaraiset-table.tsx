'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Box } from '@mui/material';
import { useMemo } from 'react';
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
import { HarkinnanvaraisuusTila } from '@/app/lib/valintalaskenta-service';
import { ophColors } from '@opetushallitus/oph-design-system';
import { isDefined } from 'remeda';
const TRANSLATIONS_PREFIX = 'harkinnanvaraiset.taulukko';

export type HarkinnanvarainenTilaValue = HarkinnanvaraisuusTila | '';

export type HarkinnanvaraisetTilatByHakemusOids = Record<
  string,
  HarkinnanvarainenTilaValue
>;

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
        renderFn: (props) => {
          const isDirty = isDefined(harkinnanvaraisetTilat[props.hakemusOid]);
          return (
            <LocalizedSelect
              sx={{
                minWidth: '150px',
                '& .MuiOutlinedInput-notchedOutline': isDirty
                  ? {
                      borderColor: ophColors.yellow1,
                      borderWidth: '2px',
                    }
                  : {},
              }}
              clearable={true}
              placeholder={t('harkinnanvaraiset.tila-placeholder')}
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
              value={
                harkinnanvaraisetTilat[props.hakemusOid] ??
                props.harkinnanvarainenTila ??
                ''
              }
              onChange={(e) => {
                onHarkinnanvaraisetTilatChange?.({
                  [props.hakemusOid]: e.target
                    .value as HarkinnanvarainenTilaValue,
                });
              }}
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
