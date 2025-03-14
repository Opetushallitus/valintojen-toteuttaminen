import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import {
  SijoitteluajonValintatapajonoValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { SelectChangeEvent, Typography } from '@mui/material';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { SijoittelunTulosStyledCell } from './sijoittelun-tulos-styled-cell';
import {
  isVastaanottotilaJulkaistavissa,
  isVastaanottoPossible,
} from '@/lib/sijoittelun-tulokset-utils';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { SijoittelunTulosChangeParams } from '../lib/sijoittelun-tulokset-state';
import { useVastaanottoTilaOptions } from '@/hooks/useVastaanottoTilaOptions';
import { useIsValintaesitysJulkaistavissa } from '@/hooks/useIsValintaesitysJulkaistavissa';
import { useHakijanVastaanottotila } from '../hooks/useHakijanVastaanottotila';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { ClientSpinner } from '@/components/client-spinner';

const HakijanVastaanottoTilaSection = ({
  haku,
  hakukohde,
  valintatapajono,
  vastaanottotila,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  hakijanVastaanottoTila?: VastaanottoTila;
  vastaanottotila: VastaanottoTila;
}) => {
  const { t } = useTranslations();

  const { data: hakijoidenVastaanottoTila } = useHakijanVastaanottotila(
    haku.oid,
    hakukohde.oid,
    valintatapajono.oid,
    valintatapajono.hakemukset.map((h) => h.hakemusOid),
  );

  const hakijanVastaanottoTila = hakijoidenVastaanottoTila?.find(
    (vastaanottoTila) =>
      vastaanottoTila.hakemusOid === vastaanottoTila.hakemusOid,
  )?.vastaanottotila;

  if (hakijanVastaanottoTila && hakijanVastaanottoTila !== vastaanottotila) {
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
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
  hakemus: SijoittelunHakemusValintatiedoilla;
  disabled: boolean;
  updateForm: (params: SijoittelunTulosChangeParams) => void;
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

  const { julkaistavissa, vastaanottotila } = hakemus;

  const vastaanottotilaOptions = useVastaanottoTilaOptions();

  const updateVastaanottoTila = (event: SelectChangeEvent<string>) => {
    const tila = event.target.value as VastaanottoTila;
    updateForm({ hakemusOid: hakemus.hakemusOid, vastaanottotila: tila });
  };

  const updateJulkaistu = () => {
    updateForm({
      hakemusOid: hakemus.hakemusOid,
      julkaistavissa: !julkaistavissa,
    });
  };

  return (
    <SijoittelunTulosStyledCell>
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
            <HakijanVastaanottoTilaSection
              haku={haku}
              hakukohde={hakukohde}
              valintatapajono={valintatapajono}
              vastaanottotila={vastaanottotila}
            />
          </QuerySuspenseBoundary>
          <LocalizedSelect
            ariaLabel={t('sijoittelun-tulokset.taulukko.vastaanottotieto')}
            value={vastaanottotila}
            onChange={updateVastaanottoTila}
            options={vastaanottotilaOptions}
            disabled={disabled}
          />
        </>
      )}
    </SijoittelunTulosStyledCell>
  );
};
