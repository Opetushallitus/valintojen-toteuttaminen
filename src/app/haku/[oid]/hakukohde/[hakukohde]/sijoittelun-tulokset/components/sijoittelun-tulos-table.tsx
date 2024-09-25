'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  createStickyHakijaColumn,
  makeColumnWithCustomRender,
  makeCountColumn,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import {
  IlmoittautumisTila,
  SijoittelunHakemusEnriched,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { useMemo } from 'react';
import { Box, Checkbox, FormControlLabel, styled } from '@mui/material';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { MaksunTila } from '@/app/lib/types/ataru-types';

const TRANSLATIONS_PREFIX = 'sijoittelun-tulokset.taulukko';

const StyledCell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  rowGap: 1,
  minWidth: '240px',
});

const showHyvaksyVarasijalta = (hakemus: SijoittelunHakemusEnriched) =>
  hakemus.tila === SijoittelunTila.VARALLA ||
  (hakemus.hyvaksyttyVarasijalta &&
    [
      SijoittelunTila.HYVAKSYTTY,
      SijoittelunTila.PERUUNTUNUT,
      SijoittelunTila.VARALLA,
      SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    ].includes(hakemus.tila));

const SijoittelunTilaCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  return (
    <StyledCell>
      <span>{t(`sijoitteluntila.${hakemus.tila}`)}</span>
      {showHyvaksyVarasijalta(hakemus) && (
        <FormControlLabel
          label={t('sijoittelun-tulokset.varasijalta')}
          control={
            <Checkbox
              checked={hakemus.hyvaksyttyVarasijalta}
              onChange={() => ''}
            />
          }
        />
      )}
      <FormControlLabel
        label={t('sijoittelun-tulokset.ehdollinen')}
        control={
          <Checkbox
            checked={hakemus.ehdollisestiHyvaksyttavissa}
            onChange={() => ''}
          />
        }
      />
    </StyledCell>
  );
};

const VastaanOttoCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  const vastaanottotilaOptions = Object.values(VastaanottoTila).map((tila) => {
    return { value: tila as string, label: t(`vastaanottotila.${tila}`) };
  });

  return (
    <StyledCell>
      <FormControlLabel
        label={t('sijoittelun-tulokset.julkaistavissa')}
        control={
          <Checkbox checked={hakemus.julkaistavissa} onChange={() => ''} />
        }
      />
      <OphFormControl
        label={t('sijoittelun-tulokset.hakijalle-naytetaan')}
        sx={{ fontWeight: 400 }}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            labelId={labelId}
            value={hakemus.vastaanottotila}
            onChange={() => ''}
            options={vastaanottotilaOptions}
          />
        )}
      />
    </StyledCell>
  );
};

const IlmoittautumisCell = ({
  hakemus,
}: {
  hakemus: SijoittelunHakemusEnriched;
}) => {
  const { t } = useTranslations();

  const ilmoittautumistilaOptions = Object.values(IlmoittautumisTila).map(
    (tila) => {
      return { value: tila as string, label: t(`ilmoittautumistila.${tila}`) };
    },
  );

  return (
    <LocalizedSelect
      value={hakemus.ilmoittautumisTila}
      onChange={() => ''}
      options={ilmoittautumistilaOptions}
    />
  );
};

const MaksuCell = ({ hakemus }: { hakemus: SijoittelunHakemusEnriched }) => {
  const { t } = useTranslations();

  const maksuntilaOptions = Object.values(MaksunTila).map((tila) => {
    return { value: tila as string, label: t(`maksuntila.${tila}`) };
  });

  return hakemus.maksuntila ? (
    <LocalizedSelect
      value={hakemus.maksuntila}
      onChange={() => ''}
      options={maksuntilaOptions}
    />
  ) : (
    <></>
  );
};

export const SijoittelunTulosTable = ({
  hakemukset,
  setSort,
  sort,
}: {
  hakemukset: SijoittelunHakemusEnriched[];
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const { t } = useTranslations();

  const columns = useMemo(() => {
    const stickyHakijaColumn = createStickyHakijaColumn('sijoittelun-tulos', t);
    return [
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.jonosija`),
        key: 'jonosija',
        amountProp: 'jonosija',
      }),
      stickyHakijaColumn,
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.hakutoive`),
        key: 'hakutoive',
        amountProp: 'hakutoive',
      }),
      makeCountColumn<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.pisteet`),
        key: 'pisteet',
        amountProp: 'pisteet',
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.tila`),
        key: 'sijoittelunTila',
        renderFn: (props) => <SijoittelunTilaCell hakemus={props} />,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.vastaanottotieto`),
        key: 'vastaanottotila',
        renderFn: (props) => <VastaanOttoCell hakemus={props} />,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.ilmoittautumistieto`),
        key: 'ilmoittautumisTila',
        renderFn: (props) => <IlmoittautumisCell hakemus={props} />,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.maksuntila`),
        key: 'maksuntila',
        renderFn: (props) => <MaksuCell hakemus={props} />,
      }),
      makeColumnWithCustomRender<SijoittelunHakemusEnriched>({
        title: t(`${TRANSLATIONS_PREFIX}.toiminnot`),
        key: 'toiminnot',
        renderFn: () => <span>...</span>,
      }),
    ];
  }, [t]);

  return (
    <ListTable
      rowKeyProp="hakijaOid"
      columns={columns}
      rows={hakemukset}
      sort={sort}
      setSort={setSort}
      translateHeader={false}
      sx={{ overflowX: 'auto', width: 'unset' }}
      wrapperStyle={{ display: 'block' }}
    />
  );
};
