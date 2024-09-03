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
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
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
      />
    </Box>
  );
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

  const hakijaColumn = makeExternalLinkColumn<HakemuksenPistetiedot>({
    linkBuilder: buildLinkToPerson,
    title: t('hakeneet.taulukko.hakija'),
    key: 'hakijanNimi',
    nameProp: 'hakijanNimi',
    linkProp: 'hakijaOid',
  });

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
    />
  );
};

/*const TableWrapper = styled(Box)({
  position: 'relative',
  display: 'block',
  width: '100%',
  overflowX: 'auto',
});

export const PisteSyottoTable2 = ({
  pistetiedot,
  setSort,
  sort,
  kokeet,
}: {
  pistetiedot: HakemuksenPistetiedot[];
  sort: string;
  setSort: (sort: string) => void;
  kokeet: Valintakoe[]}) => {
    
    const { t } = useTranslations();

    const [muuttuneetHakeneet, setMuuttuneetHakeneet] = useState<HakemuksenPistetiedot[]>([]);

    const updateHakeneet = (value: string, hakemusOid: string, koeTunniste: string, updateArvo: boolean) => {
      const s = new Date().getTime();
      let hakenut = muuttuneetHakeneet.find(h => h.hakemusOid === hakemusOid);
      const existing: boolean = !!hakenut;
      hakenut = hakenut || pistetiedot.find(h => h.hakemusOid === hakemusOid);
      const koe = hakenut?.valintakokeenPisteet.find(k => k.tunniste === koeTunniste);
      if (hakenut && koe) {
        if (updateArvo) {
          koe.arvo = value;
        } else {
          koe.osallistuminen = value as ValintakoeOsallistuminen;
        }
        if (existing) {
          setMuuttuneetHakeneet(muuttuneetHakeneet.map(h => h.hakemusOid === hakemusOid ? hakenut : h)); 
        } else {
          setMuuttuneetHakeneet([...muuttuneetHakeneet, ...[hakenut]])
        }
      }
    }
    
    return ( 
      <TableWrapper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {t('hakeneet.taulukko.hakija')}
              </TableCell>
              {kokeet.map(koe => (
                <TableCell key={'header-koe-' + koe.tunniste}>{koe.kuvaus}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pistetiedot.map(tieto => (
              <TableRow key={'body-row-' + tieto.hakemusOid}>
                <TableCell>{tieto.hakijanNimi}</TableCell>
                {tieto.valintakokeenPisteet.filter(piste => kokeet.some(k => k.tunniste === piste.tunniste)).map(piste => (
                  <TableCell key={'body-row-' + tieto.hakemusOid + piste.tunniste} >
                    <KoeCell pisteTiedot={tieto} koe={kokeet.find(k => k.tunniste === piste.tunniste)} updateHakeneet={updateHakeneet}/>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    );
  };*/
