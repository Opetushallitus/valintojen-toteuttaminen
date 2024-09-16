'use client';
import ListTable, {
  makeColumnWithCustomRender,
} from '@/app/components/table/list-table';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';
import { colors } from '@opetushallitus/oph-design-system';
import { isNotPartOfThisHakukohde } from '../pistesyotto-utils';
import { ReadOnlyKoeCell } from './koe-readonly-cell';
import { KoeCell } from './koe-cell';
import { ChangePisteSyottoFormParams } from '../pistesyotto-form';
import { hakijaColumn } from '@/app/components/table/hakija-column';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useMemo } from 'react';

const stickyColumnStyle: React.CSSProperties = {
  minWidth: '260px',
  position: 'sticky',
  left: 0,
  boxShadow: `0 5px 3px 2px ${colors.grey200}`,
  zIndex: 1,
  backgroundColor: colors.white,
};

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
  kokeet: Valintakoe[];
  updateForm: (params: ChangePisteSyottoFormParams) => void;
  disabled: boolean;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = Object.assign(hakijaColumn, {
      style: stickyColumnStyle,
      title: t('hakeneet.taulukko.hakija'),
    });

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
    />
  );
};
