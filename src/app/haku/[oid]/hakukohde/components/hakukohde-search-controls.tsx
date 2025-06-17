import { FormGroup, FormLabel } from '@mui/material';
import { HakukohdeSearchInput } from './hakukohde-search-input';
import {
  OphButton,
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  useHakukohdeSearchParamsState,
  useHakukohdeSearchResults,
} from '@/hooks/useHakukohdeSearch';
import { useState } from 'react';
import { Collapsible } from '@/components/collapsible';
import { withDefaultProps } from '@/lib/mui-utils';
import { LocalizedSelect } from '@/components/localized-select';

const FILTERS_LABEL = 'hakukohde-filters-label';

const FilterButton = withDefaultProps(OphButton, {
  variant: 'text',
  sx: {
    alignSelf: 'flex-end',
    fontWeight: 'normal',
    padding: 0,
    marginRight: 2,
  },
});

export const HakukohdeSearchControls = ({ hakuOid }: { hakuOid: string }) => {
  const { t, translateEntity } = useTranslations();

  const {
    withValintakoe,
    setWithValintakoe,
    withoutLaskenta,
    setWithoutLaskenta,
    sijoittelematta,
    setSijoittelematta,
    julkaisematta,
    setJulkaisematta,
    varasijatayttoPaattamatta,
    setVarasijatayttoPaattamatta,
    isSomeHakukohdeFilterSelected,
    koulutustyyppi,
    setKoulutustyyppi,
  } = useHakukohdeSearchParamsState();

  const { koulutustyyppiOptions } = useHakukohdeSearchResults(hakuOid);

  const [areFiltersVisible, setAreFiltersVisible] = useState(
    () => isSomeHakukohdeFilterSelected,
  );

  const koulutusTyyppiOptionsMapped = koulutustyyppiOptions.map((kt) => ({
    value: kt.koodiUri,
    label: translateEntity(kt.nimi),
  }));

  return (
    <>
      <HakukohdeSearchInput />
      <Collapsible
        titleOpen={t('haku.vahemman-hakuehtoja')}
        titleClosed={t('haku.lisaa-hakuehtoja')}
        isOpen={areFiltersVisible}
        setIsOpen={setAreFiltersVisible}
        ButtonComponent={FilterButton}
      >
        <FormLabel id={FILTERS_LABEL}>
          {t('haku.hakukohde-suodattimet-otsikko')}
        </FormLabel>
        <FormGroup aria-labelledby={FILTERS_LABEL} sx={{ marginBottom: 1 }}>
          <OphCheckbox
            label={t('haku.on-valintakoe')}
            checked={withValintakoe}
            onChange={() => setWithValintakoe((checked) => !checked)}
          />
          <OphCheckbox
            label={t('haku.ilman-laskentaa')}
            checked={withoutLaskenta}
            onChange={() => setWithoutLaskenta((checked) => !checked)}
          />
          <OphCheckbox
            label={t('haku.sijoittelematta')}
            checked={sijoittelematta}
            onChange={() => setSijoittelematta((checked) => !checked)}
          />
          <OphCheckbox
            label={t('haku.julkaisematta')}
            checked={julkaisematta}
            onChange={() => setJulkaisematta((checked) => !checked)}
          />
          <OphCheckbox
            label={t('haku.varasijataytto-paattamatta')}
            checked={varasijatayttoPaattamatta}
            onChange={() => setVarasijatayttoPaattamatta((checked) => !checked)}
          />
          {koulutusTyyppiOptionsMapped.length > 1 && (
            <OphFormFieldWrapper
              sx={{
                width: 'auto',
                maxWidth: '95%',
                minWidth: '140px',
                textAlign: 'left',
                marginTop: '5px',
              }}
              label={t('haku.koulutustyyppi')}
              renderInput={({ labelId }) => (
                <LocalizedSelect
                  id="sijoittelun-tila-select"
                  labelId={labelId}
                  value={koulutustyyppi}
                  onChange={(event) => setKoulutustyyppi(event.target.value)}
                  options={koulutusTyyppiOptionsMapped}
                  clearable
                />
              )}
            />
          )}
        </FormGroup>
      </Collapsible>
    </>
  );
};
