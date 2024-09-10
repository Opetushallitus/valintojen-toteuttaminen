'use client';
import ListTable, {
  makeColumnWithCustomRender,
  makeExternalLinkColumn,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';
import { AnyEventObject } from 'xstate';
import { colors } from '@opetushallitus/oph-design-system';
import { isNotPartOfThisHakukohde } from '../pistesyotto-utils';
import { ReadOnlyKoeCell } from './koe-readonly-cell';
import { KoeCell } from './koe-cell';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

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
  send,
}: {
  pistetiedot: HakemuksenPistetiedot[];
  sort: string;
  setSort: (sort: string) => void;
  kokeet: Valintakoe[];
  send: (event: AnyEventObject) => void;
}) => {
  const { t } = useTranslations();

  const hakijaColumn = Object.assign(
    makeExternalLinkColumn<HakemuksenPistetiedot>({
      linkBuilder: buildLinkToPerson,
      title: t('hakeneet.taulukko.hakija'),
      key: 'hakijanNimi',
      nameProp: 'hakijanNimi',
      linkProp: 'hakijaOid',
    }),
    { style: stickyColumnStyle },
  );

  const koeColumns = kokeet.map((koe) => {
    return makeColumnWithCustomRender<HakemuksenPistetiedot>({
      title: koe.kuvaus,
      key: koe.tunniste,
      renderFn: (props) =>
        isNotPartOfThisHakukohde(
          props.valintakokeenPisteet.find((p) => p.tunniste === koe.tunniste)!,
        ) ? (
          <ReadOnlyKoeCell pisteTiedot={props} koe={koe} />
        ) : (
          <KoeCell pisteTiedot={props} koe={koe} send={send} />
        ),
      sortable: false,
    });
  });

  const columns = [hakijaColumn, ...koeColumns];

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
