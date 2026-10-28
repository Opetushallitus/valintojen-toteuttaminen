import { useTranslations } from '@/lib/localization/useTranslations';
import { byLocaleCompare } from '@/lib/localization/translation-utils';
import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import { makeGenericColumn } from '@/components/table/table-columns';
import { ListTableColumn } from '@/components/table/table-types';
import { Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { groupBy, prop, unique } from 'remeda';
import { AvaimetTooltipButton } from './AvaimetTooltipButton';
import {
  AvainArvoRow,
  AvainArvoTable,
  makeArvoColumn,
  makeAvainColumn,
} from './AvainArvoTable';
import {
  collectNimetytArvot,
  formatArvo,
} from '../lib/valintalaskentahistoriaUtils';

const AVAIMET_COLUMNS = [
  makeAvainColumn('valintalaskentahistoria.avain', '50%'),
  makeArvoColumn('valintalaskentahistoria.arvo'),
];

// Arvojen nimet ovat pitkiä, muut sarakkeet lyhyitä. Muille sarakkeille annetaan kiinteät
// leveydet, jolloin nimi-sarake (auto) saa kiinteässä asettelussa kaiken jäljelle jäävän tilan.
const ARVOT_COLUMNS: Array<ListTableColumn<AvainArvoRow>> = [
  {
    ...makeAvainColumn('valintalaskentahistoria.nimi', 'auto'),
    // Nimen perässä näytetään nimetyn arvon muut avaimet, joiden perusteella samannimiset
    // arvot voi erottaa toisistaan
    render: ({ avain, muutAvaimet = [] }) => (
      <span>
        {avain}
        {muutAvaimet.length > 0 && (
          <AvaimetTooltipButton avaimet={muutAvaimet} />
        )}
      </span>
    ),
  },
  makeGenericColumn<AvainArvoRow>({
    title: 'valintalaskentahistoria.tyyppi',
    key: 'tyyppi',
    valueProp: 'tyyppi',
    style: { width: '180px' },
  }),
  makeGenericColumn<AvainArvoRow>({
    title: 'valintalaskentahistoria.jarjestyskriteerit',
    key: 'jarjestyskriteerit',
    valueProp: 'jarjestyskriteerit',
    style: { width: '160px' },
  }),
  makeArvoColumn('valintalaskentahistoria.tulos', '100px'),
];

type NimettyArvoRow = AvainArvoRow & { jarjestyskriteeriNumero: number };

// Sama nimetty arvo voi esiintyä funktiopuussa useasti (esim. usean järjestyskriteerin
// kaavoissa). Täysin samanlaiset solmut yhdistetään yhdeksi riviksi, ja rivillä näytetään
// järjestyskriteerit, joissa arvo esiintyy. Nimen lisäksi avaimissa voi olla alifunktioiden
// tallennettuja tuloksia, joten ne kuuluvat vertailuun, jottei eri tuloksista koostettuja
// arvoja yhdistetä.
const toNimettyArvoRow = (
  solmu: Valintalaskentahistoria,
  jarjestyskriteeriNumero: number,
): NimettyArvoRow => {
  // Funktio on aina "Nimetty lukuarvo"/"Nimetty totuusarvo", varsinainen nimi on avaimissa
  const { nimi, ...muutAvaimet } = solmu.avaimet ?? {};
  const avain = nimi ? formatArvo(nimi) : solmu.funktio;
  const tyyppi = solmu.funktio;
  const arvo = formatArvo(solmu.tulos);
  return {
    id: JSON.stringify([avain, tyyppi, arvo, muutAvaimet]),
    avain,
    tyyppi,
    arvo,
    muutAvaimet: Object.entries(muutAvaimet),
    jarjestyskriteeriNumero,
  };
};

export const HistorianAvaimetJaArvot = ({
  historiat,
}: {
  historiat: Array<Valintalaskentahistoria>;
}) => {
  const { t } = useTranslations();
  const [avaimetVisible, setAvaimetVisible] = useState(false);
  const [arvotVisible, setArvotVisible] = useState(false);

  const avaimet = Object.assign(
    {},
    ...historiat.map((historia) => historia.avaimet ?? {}),
  ) as Record<string, unknown>;

  const avainRows = Object.entries(avaimet)
    .map(([avain, arvo]) => ({
      id: avain,
      avain,
      arvo: formatArvo(arvo),
    }))
    .sort(byLocaleCompare('avain'));

  const nimetytArvot = historiat.flatMap((historia, index) =>
    collectNimetytArvot(historia).map((solmu) =>
      toNimettyArvoRow(solmu, index + 1),
    ),
  );

  const arvoRows = Object.values(groupBy(nimetytArvot, prop('id')))
    .map(([{ jarjestyskriteeriNumero, ...row }, ...muut]) => ({
      ...row,
      jarjestyskriteerit: unique([
        jarjestyskriteeriNumero,
        ...muut.map(prop('jarjestyskriteeriNumero')),
      ]).join(', '),
    }))
    .sort(byLocaleCompare('avain'));

  return (
    // Painikkeet ovat rinnakkain, ja täysleveä taulukko rivittyy oman painikkeensa perään
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
      <OphButton
        variant="outlined"
        aria-expanded={avaimetVisible}
        onClick={() => setAvaimetVisible((visible) => !visible)}
      >
        {t(
          avaimetVisible
            ? 'valintalaskentahistoria.piilota-avaimet'
            : 'valintalaskentahistoria.nayta-avaimet',
        )}
      </OphButton>
      {avaimetVisible && (
        <AvainArvoTable
          rows={avainRows}
          columns={AVAIMET_COLUMNS}
          emptyText={t('valintalaskentahistoria.ei-avaimia')}
        />
      )}
      <OphButton
        variant="outlined"
        aria-expanded={arvotVisible}
        onClick={() => setArvotVisible((visible) => !visible)}
      >
        {t(
          arvotVisible
            ? 'valintalaskentahistoria.piilota-arvot'
            : 'valintalaskentahistoria.nayta-arvot',
        )}
      </OphButton>
      {arvotVisible && (
        <AvainArvoTable
          rows={arvoRows}
          columns={ARVOT_COLUMNS}
          emptyText={t('valintalaskentahistoria.ei-arvoja')}
        />
      )}
    </Stack>
  );
};
