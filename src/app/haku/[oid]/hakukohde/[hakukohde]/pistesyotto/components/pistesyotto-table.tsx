'use client';
import { HakemuksenPistetiedot } from '@/lib/types/laskenta-types';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { ReadOnlyKoeCell } from './koe-readonly-cell';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useMemo } from 'react';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { isNotPartOfThisHakukohde } from '../lib/pistesyotto-utils';
import { PistesyottoActorRef } from '@/lib/state/pistesyotto-state';
import { PisteSyottoKoeInputs } from './pistesyotto-koe-inputs';

export const PisteSyottoTable = ({
  pistetiedot,
  setSort,
  sort,
  kokeet,
  pistesyottoActorRef,
  pisteSyottoDisabled,
}: {
  pistetiedot: Array<HakemuksenPistetiedot>;
  sort: string;
  setSort: (newSort: string) => void;
  kokeet: Array<ValintakoeAvaimet>;
  pistesyottoActorRef: PistesyottoActorRef;
  pisteSyottoDisabled: boolean;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn(t);
    const koeColumns = kokeet.map((koe) => {
      return makeColumnWithCustomRender<HakemuksenPistetiedot>({
        title: koe.kuvaus,
        key: koe.tunniste,
        renderFn: (props) => {
          const matchingKoePisteet = props.valintakokeenPisteet.find(
            (p) => p.tunniste === koe.tunniste,
          );
          return isNotPartOfThisHakukohde(matchingKoePisteet) ? (
            <ReadOnlyKoeCell koe={koe} koePisteet={matchingKoePisteet} />
          ) : (
            <PisteSyottoKoeInputs
              hakemusOid={props.hakemusOid}
              koe={koe}
              pistesyottoActorRef={pistesyottoActorRef}
              disabled={pisteSyottoDisabled}
            />
          );
        },
        sortable: false,
      });
    });
    return [stickyHakijaColumn, ...koeColumns];
  }, [kokeet, t, pistesyottoActorRef, pisteSyottoDisabled]);

  return (
    <ListTable
      rowKeyProp="hakemusOid"
      columns={columns}
      rows={pistetiedot}
      sort={sort}
      setSort={setSort}
      translateHeader={false}
    />
  );
};
