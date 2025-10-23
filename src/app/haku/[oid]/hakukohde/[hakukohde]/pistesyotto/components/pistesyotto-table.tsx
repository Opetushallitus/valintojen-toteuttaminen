'use client';
import { HakemuksenPistetiedot } from '@/lib/types/laskenta-types';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { ReadOnlyKoeCell } from './koe-readonly-cell';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useMemo } from 'react';
import { Range } from '@/components/range';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { isNotPartOfThisHakukohde } from '../lib/pistesyotto-utils';
import { isNullish } from 'remeda';
import { HakukohdePistesyottoActorRef } from '../lib/hakukohde-pistesyotto-state';
import { KoeInputs } from './koe-inputs';

export const PisteSyottoTable = ({
  pistetiedot,
  setSort,
  sort,
  kokeet,
  pistesyottoActorRef,
  pisteSyottoDisabled,
  naytaVainLaskentaanVaikuttavat,
}: {
  pistetiedot: Array<HakemuksenPistetiedot>;
  sort: string;
  setSort: (newSort: string) => void;
  kokeet: Array<ValintakoeAvaimet>;
  pistesyottoActorRef: HakukohdePistesyottoActorRef;
  pisteSyottoDisabled: boolean;
  naytaVainLaskentaanVaikuttavat: boolean;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn(t);
    const koeColumns = kokeet.map((koe) => {
      return makeColumnWithCustomRender<HakemuksenPistetiedot>({
        title: `${koe.kuvaus} ${Range({ min: koe.min, max: koe.max })}`,
        key: koe.tunniste,
        renderFn: (props) => {
          const matchingKoePisteet = props.valintakokeenPisteet.find(
            (p) => p.tunniste === koe.tunniste,
          );
          return isNullish(matchingKoePisteet) ? (
            <></>
          ) : isNotPartOfThisHakukohde(matchingKoePisteet) ? (
            <ReadOnlyKoeCell koe={koe} koePisteet={matchingKoePisteet} />
          ) : (
            <KoeInputs
              hakemusOid={props.hakemusOid}
              koe={koe}
              pistesyottoActorRef={pistesyottoActorRef}
              naytaVainLaskentaanVaikuttavat={naytaVainLaskentaanVaikuttavat}
              disabled={pisteSyottoDisabled}
            />
          );
        },
        sortable: false,
      });
    });
    return [stickyHakijaColumn, ...koeColumns];
  }, [
    kokeet,
    t,
    pistesyottoActorRef,
    pisteSyottoDisabled,
    naytaVainLaskentaanVaikuttavat,
  ]);

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
