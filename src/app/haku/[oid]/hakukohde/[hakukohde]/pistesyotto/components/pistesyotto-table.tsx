'use client';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { ReadOnlyKoeCell } from './koe-readonly-cell';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useMemo } from 'react';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { isNotPartOfThisHakukohde } from '../lib/pistesyotto-utils';
import { KoeInputs } from '@/app/components/koe-inputs';
import { AnyActorRef } from 'xstate';

export const PisteSyottoTable = ({
  pistetiedot,
  setSort,
  sort,
  kokeet,
  pistesyottoActorRef,
}: {
  pistetiedot: HakemuksenPistetiedot[];
  sort: string;
  setSort: (sort: string) => void;
  kokeet: ValintakoeAvaimet[];
  pistesyottoActorRef: AnyActorRef;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn('pistesyotto', t);
    const koeColumns = kokeet.map((koe) => {
      return makeColumnWithCustomRender<HakemuksenPistetiedot>({
        title: koe.kuvaus,
        key: koe.tunniste,
        renderFn: (props) => {
          const matchingKoePisteet = props.valintakokeenPisteet.find(
            (p) => p.tunniste === koe.tunniste,
          );
          return isNotPartOfThisHakukohde(matchingKoePisteet) ? (
            <ReadOnlyKoeCell koePisteet={matchingKoePisteet} />
          ) : (
            <KoeInputs
              hakemusOid={props.hakemusOid}
              koe={koe}
              pistesyottoActorRef={pistesyottoActorRef}
            />
          );
        },
        sortable: false,
      });
    });
    return [stickyHakijaColumn, ...koeColumns];
  }, [kokeet, t, pistesyottoActorRef]);

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
