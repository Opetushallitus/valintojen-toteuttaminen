'use client';
import {
  numberValidator,
  OphInput,
  OphSelectControl,
} from '@/app/components/oph-select';
import ListTable, {
  makeColumnWithCustomRender,
  makeExternalLinkColumn,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminen,
  ValintakokeenPisteet,
} from '@/app/lib/types/laskenta-types';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';
import { Box, SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { AnyEventObject } from 'xstate';
import { PisteSyottoEvents } from './pistesyotto-state';
import { colors } from '@opetushallitus/oph-design-system';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

const KoeCell = ({
  pisteTiedot,
  send,
  koe,
}: {
  pisteTiedot: HakemuksenPistetiedot;
  send: (event: AnyEventObject) => void;
  koe: Valintakoe;
}) => {
  const findMatchingKoePisteet = (): ValintakokeenPisteet | undefined =>
    pisteTiedot.valintakokeenPisteet.find((k) => k.tunniste === koe.tunniste);

  const { t } = useTranslations();
  const [arvo, setArvo] = useState<string>(
    findMatchingKoePisteet()?.arvo ?? '',
  );
  const [osallistuminen, setOsallistuminen] =
    useState<ValintakoeOsallistuminen>(
      findMatchingKoePisteet()?.osallistuminen ??
        ValintakoeOsallistuminen.MERKITSEMATTA,
    );

  const changeArvo = (event: ChangeEvent<HTMLInputElement>) => {
    setArvo(event.target.value);
    send({
      type: PisteSyottoEvents.ADD_CHANGED_PISTETIETO,
      value: event.target.value,
      hakemusOid: pisteTiedot.hakemusOid,
      koeTunniste: koe.tunniste,
      updateArvo: true,
    });
  };

  const changeOsallistumisenTila = (
    event: SelectChangeEvent<ValintakoeOsallistuminen>,
  ) => {
    setOsallistuminen(event.target.value as ValintakoeOsallistuminen);
    send({
      type: PisteSyottoEvents.ADD_CHANGED_PISTETIETO,
      value: event.target.value,
      hakemusOid: pisteTiedot.hakemusOid,
      koeTunniste: koe.tunniste,
      updateArvo: false,
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: '0.6rem',
        minWidth: '220px',
      }}
    >
      <OphInput
        id={`koe-arvo-${pisteTiedot.hakijaOid}-${koe.tunniste}`}
        value={arvo}
        validators={[numberValidator({ min: koe.min, max: koe.max })]}
        onChange={changeArvo}
        sx={{ width: '5rem' }}
      />
      <OphSelectControl
        id={`koe-osallistuminen-${pisteTiedot.hakijaOid}-${koe.tunniste}`}
        value={osallistuminen}
        options={[
          {
            value: ValintakoeOsallistuminen.OSALLISTUI,
            label: t('valintakoe.osallistumisenTila.OSALLISTUI'),
          },
          {
            value: ValintakoeOsallistuminen.EI_OSALLISTUNUT,
            label: t('valintakoe.osallistumisenTila.EI_OSALLISTUNUT'),
          },
          {
            value: ValintakoeOsallistuminen.MERKITSEMATTA,
            label: t('valintakoe.osallistumisenTila.MERKITSEMATTA'),
          },
          {
            value: ValintakoeOsallistuminen.EI_VAADITA,
            label: t('valintakoe.osallistumisenTila.EI_VAADITA'),
          },
        ]}
        size="small"
        onChange={changeOsallistumisenTila}
        sx={{ minWidth: '150px' }}
      />
    </Box>
  );
};

const stickyColumnStyle: React.CSSProperties = {
  minWidth: '200px',
  position: 'sticky',
  left: 0,
  borderRight: `2px solid ${colors.grey100}`,
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
      renderFn: (props) => (
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
