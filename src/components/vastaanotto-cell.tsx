import { LocalizedSelect } from '@/components/localized-select';
import { TFunction } from '@/lib/localization/useTranslations';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import {
  SijoitteluajonValintatapajonoValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent, Stack, Typography } from '@mui/material';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import {
  isVastaanottotilaJulkaistavissa,
  isVastaanottoPossible,
} from '@/lib/sijoittelun-tulokset-utils';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { useVastaanottoTilaOptions } from '@/hooks/useVastaanottoTilaOptions';
import { useIsValintaesitysJulkaistavissa } from '@/hooks/useIsValintaesitysJulkaistavissa';
import { useHakijanVastaanottotila } from '@/hooks/useHakijanVastaanottotila';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { ClientSpinner } from '@/components/client-spinner';
import { ValinnanTulosChangeParams } from '@/lib/state/valinnan-tulos-machine';
import { isValidValinnanTila } from '@/lib/valinnan-tulokset-utils';
import { isKorkeakouluHaku } from '@/lib/kouta/kouta-service';
import { memo } from 'react';

const HakijanVastaanottoTilaSection = ({
  haku,
  hakukohde,
  valintatapajono,
  vastaanottoTila,
  t,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  hakijanVastaanottoTila?: VastaanottoTila;
  vastaanottoTila?: VastaanottoTila;
  t: TFunction;
}) => {
  const { data: hakijoidenVastaanottoTila } = useHakijanVastaanottotila({
    hakuOid: haku.oid,
    hakukohdeOid: hakukohde.oid,
    valintatapajonoOid: valintatapajono.oid,
    hakemusOids: valintatapajono.hakemukset.map((h) => h.hakemusOid),
  });

  const hakijanVastaanottoTila = hakijoidenVastaanottoTila?.find(
    (vastaanottoTila) =>
      vastaanottoTila.hakemusOid === vastaanottoTila.hakemusOid,
  )?.vastaanottotila;

  if (hakijanVastaanottoTila && hakijanVastaanottoTila !== vastaanottoTila) {
    return (
      <Typography>
        {t('sijoittelun-tulokset.hakijalle-naytetaan')}
        &nbsp;
        {t(`vastaanottotila.${hakijanVastaanottoTila}`)}
      </Typography>
    );
  }

  return null;
};

export type VastaanOttoCellProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  valintatapajono?: SijoitteluajonValintatapajonoValintatiedoilla;
  hakemus: Pick<
    SijoittelunHakemusValintatiedoilla,
    | 'hakemusOid'
    | 'vastaanottoTila'
    | 'julkaistavissa'
    | 'vastaanottoDeadline'
    | 'valinnanTila'
  >;
  disabled?: boolean;
  updateForm: (params: ValinnanTulosChangeParams) => void;
  mode: 'valinta' | 'sijoittelu';
  t: TFunction;
};

const ValinnanVastaanottoTila = ({
  haku,
  hakukohde,
  hakemus,
  valintatapajono,
  updateForm,
  disabled,
  t,
}: Omit<VastaanOttoCellProps, 'mode'>) => {
  const { vastaanottoTila } = hakemus;

  const vastaanottotilaOptions = useVastaanottoTilaOptions((tila) => {
    return isKorkeakouluHaku(haku)
      ? [
          VastaanottoTila.KESKEN,
          VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
          VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
          VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
          VastaanottoTila.PERUNUT,
          VastaanottoTila.PERUUTETTU,
          VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN,
        ].includes(tila)
      : [
          VastaanottoTila.KESKEN,
          VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
          VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
          VastaanottoTila.PERUNUT,
          VastaanottoTila.PERUUTETTU,
        ].includes(tila);
  });

  const updateVastaanottoTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      vastaanottoTila: event.target.value as VastaanottoTila,
    });
  };

  return (
    <>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner size={16} />}>
        {valintatapajono && (
          <HakijanVastaanottoTilaSection
            haku={haku}
            hakukohde={hakukohde}
            valintatapajono={valintatapajono}
            vastaanottoTila={vastaanottoTila}
            t={t}
          />
        )}
      </QuerySuspenseBoundary>
      <LocalizedSelect
        ariaLabel={t('sijoittelun-tulokset.taulukko.vastaanottotieto')}
        value={vastaanottoTila ?? ''}
        onChange={updateVastaanottoTila}
        options={vastaanottotilaOptions}
        disabled={disabled || !isVastaanottoPossible(hakemus)}
        error={!isValidValinnanTila(hakemus)}
      />
    </>
  );
};

const SijoittelunVastaanottoTila = ({
  haku,
  hakukohde,
  hakemus,
  valintatapajono,
  updateForm,
  disabled,
  t,
}: Omit<VastaanOttoCellProps, 'mode'>) => {
  const { vastaanottoTila } = hakemus;

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const updateVastaanottoTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      vastaanottoTila: event.target.value as VastaanottoTila,
    });
  };

  return (
    isVastaanottoPossible(hakemus) && (
      <>
        <QuerySuspenseBoundary suspenseFallback={<ClientSpinner size={16} />}>
          {valintatapajono && (
            <HakijanVastaanottoTilaSection
              haku={haku}
              hakukohde={hakukohde}
              valintatapajono={valintatapajono}
              vastaanottoTila={vastaanottoTila}
              t={t}
            />
          )}
        </QuerySuspenseBoundary>
        <LocalizedSelect
          ariaLabel={t('sijoittelun-tulokset.taulukko.vastaanottotieto')}
          value={vastaanottoTila ?? ''}
          onChange={updateVastaanottoTila}
          options={vastaanottotilaOptions}
          disabled={disabled}
        />
      </>
    )
  );
};

export const VastaanOttoCell = memo(function VastaanottoCell({
  haku,
  hakukohde,
  valintatapajono,
  hakemus,
  disabled,
  updateForm,
  mode,
  t,
}: VastaanOttoCellProps) {
  const isValintaesitysJulkaistavissa = useIsValintaesitysJulkaistavissa({
    haku,
  });

  const { julkaistavissa } = hakemus;

  const updateJulkaistu = () => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      julkaistavissa: !julkaistavissa,
    });
  };

  return (
    <Stack gap={1} sx={{ minWidth: '180px' }}>
      <OphCheckbox
        checked={Boolean(julkaistavissa)}
        onChange={updateJulkaistu}
        label={t('sijoittelun-tulokset.julkaistavissa')}
        error={!isValidValinnanTila(hakemus) && !julkaistavissa}
        disabled={
          disabled ||
          !isVastaanottotilaJulkaistavissa(hakemus) ||
          !isValintaesitysJulkaistavissa
        }
      />
      {hakemus.vastaanottoDeadline && (
        <Typography>
          {t('sijoittelun-tulokset.vastaanottoaikaraja')}:{' '}
          {toFormattedDateTimeString(hakemus.vastaanottoDeadline)}
        </Typography>
      )}
      {mode === 'sijoittelu' ? (
        <SijoittelunVastaanottoTila
          haku={haku}
          hakukohde={hakukohde}
          hakemus={hakemus}
          valintatapajono={valintatapajono}
          updateForm={updateForm}
          disabled={disabled}
          t={t}
        />
      ) : (
        <ValinnanVastaanottoTila
          haku={haku}
          hakukohde={hakukohde}
          hakemus={hakemus}
          valintatapajono={valintatapajono}
          updateForm={updateForm}
          disabled={disabled}
          t={t}
        />
      )}
    </Stack>
  );
});
