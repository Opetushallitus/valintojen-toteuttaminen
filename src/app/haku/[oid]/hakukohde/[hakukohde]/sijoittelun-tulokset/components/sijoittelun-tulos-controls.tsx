import { useTranslations } from '@/app/lib/localization/useTranslations';
import { Box, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/app/lib/types/sijoittelu-types';
import { LocalizedSelect } from '@/app/components/localized-select';
import { useSijoittelunTulosSearchParams } from '../hooks/useSijoittelunTulosSearch';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { Haku, Hakukohde } from '@/app/lib/kouta/kouta-types';
import { isKorkeakouluHaku } from '@/app/lib/kouta/kouta-service';
import { SearchInput } from '@/app/components/search-input';
import { OtherActionsHakukohdeButton } from './other-actions-hakukohde-button';
import { useSuspenseQueries } from '@tanstack/react-query';
import { getDocumentIdForHakukohde } from '@/app/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { SijoittelunTuloksetExcelDownloadButton } from './sijoittelun-tulokset-excel-download-button';

export const SijoittelunTulosControls = ({
  haku,
  hakukohde,
  sijoitteluajoId,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  sijoitteluajoId: string | undefined;
}) => {
  const {
    searchPhrase,
    setSearchPhrase,
    sijoittelunTila,
    setSijoittelunTila,
    showOnlyEhdolliset,
    setShowOnlyEhdolliset,
    showOnlyMuuttuneetViimeSijoittelussa,
    setShowOnlyMuuttuneetViimeSijoittelussa,
  } = useSijoittelunTulosSearchParams();

  const { t } = useTranslations();

  const [
    hyvaksymiskirjeDocumentQuery,
    osoitetarraDocumentQuery,
    tuloksetDocumentQuery,
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: [
          'getDocumentIdForHakukohde',
          'hyvaksymiskirjeet',
          hakukohde.oid,
        ],
        queryFn: () =>
          getDocumentIdForHakukohde(hakukohde.oid, 'hyvaksymiskirjeet'),
      },
      {
        queryKey: ['getDocumentIdForHakukohde', 'osoitetarrat', hakukohde.oid],
        queryFn: () => getDocumentIdForHakukohde(hakukohde.oid, 'osoitetarrat'),
      },
      {
        queryKey: [
          'getDocumentIdForHakukohde',
          'sijoitteluntulokset',
          hakukohde.oid,
        ],
        queryFn: () =>
          getDocumentIdForHakukohde(hakukohde.oid, 'sijoitteluntulokset'),
      },
    ],
  });

  const changeSijoittelunTila = (e: SelectChangeEvent) => {
    setSijoittelunTila(e.target.value);
  };

  const changeShowOnlyEhdolliset = () => {
    setShowOnlyEhdolliset(!showOnlyEhdolliset);
  };

  const changeShowOnlyMuuttuneetViimeSijoittelussa = () => {
    setShowOnlyMuuttuneetViimeSijoittelussa(
      !showOnlyMuuttuneetViimeSijoittelussa,
    );
  };

  const sijoitteluntilaOptions = Object.values(SijoittelunTila).map((tila) => {
    return { value: tila as string, label: t(`sijoitteluntila.${tila}`) };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: 2,
        }}
      >
        <SearchInput
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          name="sijoittelun-tulos-search"
        />
        <OphFormFieldWrapper
          sx={{
            width: 'auto',
            minWidth: '140px',
            textAlign: 'left',
          }}
          label={t('sijoittelun-tulokset.taulukko.tila')}
          renderInput={({ labelId }) => (
            <LocalizedSelect
              id="sijoittelun-tila-select"
              labelId={labelId}
              value={sijoittelunTila}
              onChange={changeSijoittelunTila}
              options={sijoitteluntilaOptions}
              clearable
            />
          )}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2 }}>
        <OphCheckbox
          checked={showOnlyMuuttuneetViimeSijoittelussa}
          onChange={changeShowOnlyMuuttuneetViimeSijoittelussa}
          label={t('sijoittelun-tulokset.nayta-muuttuneet')}
        />
        {isKorkeakouluHaku(haku) && (
          <OphCheckbox
            checked={showOnlyEhdolliset}
            onChange={changeShowOnlyEhdolliset}
            label={t('sijoittelun-tulokset.nayta-ehdolliset')}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2 }}>
        {sijoitteluajoId && (
          <SijoittelunTuloksetExcelDownloadButton
            hakuOid={haku.oid}
            hakukohdeOid={hakukohde.oid}
            sijoitteluajoId={sijoitteluajoId}
          />
        )}
        {sijoitteluajoId &&
          hyvaksymiskirjeDocumentQuery.isSuccess &&
          osoitetarraDocumentQuery.isSuccess &&
          tuloksetDocumentQuery.isSuccess && (
            <OtherActionsHakukohdeButton
              disabled={false}
              haku={haku}
              hakukohde={hakukohde}
              hyvaksymiskirjeDocumentId={hyvaksymiskirjeDocumentQuery.data}
              osoitetarraDocumentId={osoitetarraDocumentQuery.data}
              tulosDocumentId={tuloksetDocumentQuery.data}
              sijoitteluajoId={sijoitteluajoId}
            />
          )}
      </Box>
    </Box>
  );
};
