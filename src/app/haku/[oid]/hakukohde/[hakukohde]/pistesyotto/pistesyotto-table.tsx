'use client';
import { OphInput, OphSelect } from '@/app/components/oph-select';
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
import {
  Valintakoe,
  ValintakoeInputTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { Box, SelectChangeEvent, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { AnyEventObject } from 'xstate';
import { PisteSyottoEvents } from './pistesyotto-state';
import { colors } from '@opetushallitus/oph-design-system';
import {
  isNotPartOfThisHakukohde,
  NOT_READABLE_REASON_MAP,
} from './pistesyotto-utils';
import {
  numberValidator,
  InputValidator,
} from '@/app/components/input-validators';

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

  const arvoValidator: InputValidator = numberValidator({
    min: koe.min,
    max: koe.max,
    nullable: true,
  });

  const { t } = useTranslations();
  const [arvo, setArvo] = useState<string>(
    findMatchingKoePisteet()?.arvo ?? '',
  );
  const [osallistuminen, setOsallistuminen] =
    useState<ValintakoeOsallistuminen>(
      findMatchingKoePisteet()?.osallistuminen ??
        ValintakoeOsallistuminen.MERKITSEMATTA,
    );

  const [arvoValid, setArvoValid] = useState<boolean>(true);
  const [helperText, setHelperText] = useState<string[] | undefined>();

  const changeArvo = (event: ChangeEvent<HTMLInputElement>) => {
    setArvo(event.target.value);
    const validationResult = arvoValidator.validate(event.currentTarget.value);
    setArvoValid(!validationResult.error);
    if (!validationResult.error) {
      send({
        type: PisteSyottoEvents.ADD_CHANGED_PISTETIETO,
        value: event.target.value,
        hakemusOid: pisteTiedot.hakemusOid,
        koeTunniste: koe.tunniste,
        updateArvo: true,
      });
      setHelperText(undefined);
    } else {
      setHelperText([validationResult.helperText!]);
    }
  };

  const changeSelectArvo = (event: SelectChangeEvent<string>) => {
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

  const arvoId = `koe-arvo-${pisteTiedot.hakijaOid}-${koe.tunniste}`;

  const getArvoOptions = () => {
    if (koe.inputTyyppi === ValintakoeInputTyyppi.BOOLEAN) {
      return [
        { value: 'true', label: t('yleinen.kylla') },
        { value: 'false', label: t('yleinen.ei') },
      ];
    }
    if (koe.inputTyyppi === ValintakoeInputTyyppi.BOOLEAN_ACCEPTED) {
      return [
        { value: 'true', label: t('yleinen.hyvaksytty') },
        { value: 'false', label: t('yleinen.hylatty') },
      ];
    }
    return koe.arvot?.map((a) => ({ value: a, label: a })) ?? [];
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
      {koe.inputTyyppi === ValintakoeInputTyyppi.INPUT && (
        <OphInput
          id={arvoId}
          value={arvo}
          error={!arvoValid}
          helperText={helperText}
          onChange={changeArvo}
          sx={{ width: '5rem' }}
        />
      )}
      {koe.inputTyyppi != ValintakoeInputTyyppi.INPUT && (
        <OphSelect
          id={arvoId}
          value={arvo}
          options={getArvoOptions()}
          size="small"
          onChange={changeSelectArvo}
          sx={{ minWidth: '150px' }}
          clearable
        />
      )}
      <OphSelect
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

const ReadOnlyCell = ({
  pisteTiedot,
  koe,
}: {
  pisteTiedot: HakemuksenPistetiedot;
  koe: Valintakoe;
}) => {
  const { t } = useTranslations();

  const pisteet = pisteTiedot.valintakokeenPisteet.find(
    (vp) => vp.tunniste === koe.tunniste,
  );
  const notReadableReason = pisteet?.osallistuminen
    ? NOT_READABLE_REASON_MAP[pisteet?.osallistuminen]
    : '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: '0.6rem',
        minWidth: '220px',
      }}
    >
      <Typography>{pisteet?.arvo}</Typography>
      <Typography>{t(notReadableReason)}</Typography>
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
      renderFn: (props) =>
        isNotPartOfThisHakukohde(
          props.valintakokeenPisteet.find((p) => p.tunniste === koe.tunniste)!,
        ) ? (
          <ReadOnlyCell pisteTiedot={props} koe={koe} />
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
