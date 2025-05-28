import { FormGroup, FormLabel } from '@mui/material';
import { HakukohdeSearchInput } from './hakukohde-search-input';
import { OphButton, OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHakukohdeSearchParamsState } from '@/hooks/useHakukohdeSearch';
import { useState } from 'react';
import { Collapsible } from '@/components/collapsible';
import { withDefaultProps } from '@/lib/mui-utils';

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

export const HakukohdeSearchControls = () => {
  const { t } = useTranslations();

  const {
    withValintakoe,
    setWithValintakoe,
    withoutLaskenta,
    setWithoutLaskenta,
  } = useHakukohdeSearchParamsState();

  const [areFiltersVisible, setAreFiltersVisible] = useState(
    () => withValintakoe,
  );

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
        </FormGroup>
      </Collapsible>
    </>
  );
};
