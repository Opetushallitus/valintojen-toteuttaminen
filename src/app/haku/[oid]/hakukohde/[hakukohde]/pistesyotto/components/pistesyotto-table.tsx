'use client';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { ReadOnlyKoeCell } from './koe-readonly-cell';
import { ChangePisteSyottoFormParams } from './pistesyotto-form';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useMemo } from 'react';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { isNotPartOfThisHakukohde } from '../lib/pistesyotto-utils';
import { KoeCell } from './koe-cell';

export const PisteSyottoTable = ({
  pistetiedot,
  setSort,
  sort,
  kokeet,
  updateForm,
  disabled,
}: {
  pistetiedot: HakemuksenPistetiedot[];
  sort: string;
  setSort: (sort: string) => void;
  kokeet: ValintakoeAvaimet[];
  updateForm: (params: ChangePisteSyottoFormParams) => void;
  disabled: boolean;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn('pistesyotto', t);

    const koeColumns = kokeet.map((koe) => {
      return makeColumnWithCustomRender<HakemuksenPistetiedot>({
        title: koe.kuvaus,
        key: koe.tunniste,
        renderFn: (props) =>
          isNotPartOfThisHakukohde(
            props.valintakokeenPisteet.find((p) => p.tunniste === koe.tunniste),
          ) ? (
            <ReadOnlyKoeCell pisteTiedot={props} koe={koe} />
          ) : (
            <KoeCell
              pisteTiedot={props}
              koe={koe}
              updateForm={updateForm}
              disabled={disabled}
            />
          ),
        sortable: false,
      });
    });
    return [stickyHakijaColumn, ...koeColumns];
  }, [kokeet, t, disabled, updateForm]);

  return (
    <ListTable
      rowKeyProp="hakemusOid"
      columns={columns}
      rows={pistetiedot}
      sort={sort}
      setSort={setSort}
      translateHeader={false}
      sx={{ overflowX: 'auto', width: 'unset' }}
      wrapperStyle={{ display: 'block' }}
    />
  );
};
