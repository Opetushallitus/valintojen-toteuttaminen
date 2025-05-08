import { useTranslations } from '@/lib/localization/useTranslations';
import { Stack, SelectChangeEvent } from '@mui/material';
import { SijoittelunTila } from '@/lib/types/sijoittelu-types';
import { LocalizedSelect } from '@/components/localized-select';
import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';
import { SearchInput } from '@/components/search-input';
import { useValinnanTuloksetSearchParams } from '../hooks/useValinnanTuloksetSearch';
import { useVastaanottoTilaOptions } from '@/hooks/useVastaanottoTilaOptions';

export const ValinnanTuloksetSearchControls = () => {
  const {
    searchPhrase,
    setSearchPhrase,
    valinnanTila,
    setValinnanTila,
    vastaanottoTila,
    setVastaanottoTila,
  } = useValinnanTuloksetSearchParams();

  const { t } = useTranslations();

  const changeValinnanTila = (e: SelectChangeEvent) => {
    setValinnanTila(e.target.value);
  };

  const changeVastaanottoTila = (e: SelectChangeEvent) => {
    setVastaanottoTila(e.target.value);
  };

  const sijoitteluntilaOptions = Object.values(SijoittelunTila).map((tila) => {
    return { value: tila as string, label: t(`sijoitteluntila.${tila}`) };
  });

  const vastaanottoTilaOptions = useVastaanottoTilaOptions();

  return (
    <Stack
      direction="row"
      gap={2}
      sx={{
        alignItems: 'flex-end',
        flexGrow: 1,
        flexWrap: 'wrap',
      }}
    >
      <SearchInput
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        name="valinnan-tulos-search"
      />
      <OphFormFieldWrapper
        sx={{
          flexBasis: '320px',
          textAlign: 'left',
        }}
        label={t('valinnan-tulokset.taulukko.valinnan-tila')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="valinnan-tila-select"
            labelId={labelId}
            value={valinnanTila}
            onChange={changeValinnanTila}
            options={sijoitteluntilaOptions}
            clearable
          />
        )}
      />
      <OphFormFieldWrapper
        sx={{
          flexBasis: '300px',
          textAlign: 'left',
        }}
        label={t('valinnan-tulokset.taulukko.vastaanoton-tila')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="vastaanoton-tila-select"
            labelId={labelId}
            value={vastaanottoTila}
            onChange={changeVastaanottoTila}
            options={vastaanottoTilaOptions}
            clearable
          />
        )}
      />
    </Stack>
  );
};
