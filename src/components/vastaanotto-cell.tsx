import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
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

const HakijanVastaanottoTilaSection = ({
  haku,
  hakukohde,
  valintatapajono,
  vastaanottoTila,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  hakijanVastaanottoTila?: VastaanottoTila;
  vastaanottoTila?: VastaanottoTila;
}) => {
  const { t } = useTranslations();

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
};

export const VastaanOttoCell = ({
  haku,
  hakukohde,
  valintatapajono,
  hakemus,
  disabled,
  updateForm,
}: VastaanOttoCellProps) => {
  const { t } = useTranslations();

  const isValintaesitysJulkaistavissa = useIsValintaesitysJulkaistavissa({
    haku,
  });

  const { julkaistavissa, vastaanottoTila } = hakemus;

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const updateVastaanottoTila = (event: SelectChangeEvent<string>) => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      vastaanottoTila: event.target.value as VastaanottoTila,
    });
  };

  const updateJulkaistu = () => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      julkaistavissa: !julkaistavissa,
    });
  };

  return (
    <Stack gap={1} sx={{ minWidth: '180px' }}>
      <OphCheckbox
        checked={julkaistavissa}
        onChange={updateJulkaistu}
        label={t('sijoittelun-tulokset.julkaistavissa')}
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
      {isVastaanottoPossible(hakemus) && (
        <>
          <QuerySuspenseBoundary suspenseFallback={<ClientSpinner size={16} />}>
            {valintatapajono && (
              <HakijanVastaanottoTilaSection
                haku={haku}
                hakukohde={hakukohde}
                valintatapajono={valintatapajono}
                vastaanottoTila={vastaanottoTila}
              />
            )}
          </QuerySuspenseBoundary>
          <LocalizedSelect
            ariaLabel={t('sijoittelun-tulokset.taulukko.vastaanottotieto')}
            value={vastaanottoTila}
            onChange={updateVastaanottoTila}
            options={vastaanottotilaOptions}
            disabled={disabled}
          />
        </>
      )}
    </Stack>
  );
};
