import { useTranslations } from '@/lib/localization/useTranslations';
import { byLocaleCompare } from '@/lib/localization/translation-utils';
import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import { makeGenericColumn } from '@/components/table/table-columns';
import { Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { DataObjectOutlined, KeyOffOutlined } from '@mui/icons-material';
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

// Arvojen nimet ovat pitkiä, tyypit ja tulokset lyhyitä. Tyypille ja tulokselle annetaan kiinteät
// leveydet, jolloin nimi-sarake (auto) saa kiinteässä asettelussa kaiken jäljelle jäävän tilan.
const ARVOT_COLUMNS = [
  makeGenericColumn<AvainArvoRow>({
    title: 'valintalaskentahistoria.numero',
    key: 'numero',
    valueProp: 'numero',
    style: { width: '60px' },
  }),
  makeAvainColumn('valintalaskentahistoria.nimi', 'auto'),
  makeGenericColumn<AvainArvoRow>({
    title: 'valintalaskentahistoria.tyyppi',
    key: 'tyyppi',
    valueProp: 'tyyppi',
    style: { width: '180px' },
  }),
  makeArvoColumn('valintalaskentahistoria.tulos', '100px'),
];

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

  const nimetytArvot = historiat.flatMap(collectNimetytArvot);

  const arvoRows = nimetytArvot.map((node, index) => ({
    // Solmuilla ei ole omaa tunnistetta, ja lista lasketaan aina samassa järjestyksessä
    id: String(index),
    numero: index + 1,
    // Funktio on aina "Nimetty lukuarvo"/"Nimetty totuusarvo", varsinainen nimi on avaimissa
    avain: node.avaimet?.nimi ? formatArvo(node.avaimet.nimi) : node.funktio,
    tyyppi: node.funktio,
    arvo: formatArvo(node.tulos),
  }));

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
          emptyIcon={<KeyOffOutlined />}
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
          emptyIcon={<DataObjectOutlined />}
        />
      )}
    </Stack>
  );
};
