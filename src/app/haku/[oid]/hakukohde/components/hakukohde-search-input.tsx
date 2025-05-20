import { SearchInput } from '@/components/search-input';
import { useHakukohdeSearchParamsState } from '@/hooks/useHakukohdeSearch';
import { useTranslations } from '@/lib/localization/useTranslations';

export const HakukohdeSearchInput = () => {
  const { searchPhrase, setSearchPhrase } = useHakukohdeSearchParamsState();
  const { t } = useTranslations();

  return (
    <SearchInput
      sx={{
        paddingRight: 2,
        flexBasis: 'auto',
      }}
      name="hakukohde-search"
      searchPhrase={searchPhrase}
      setSearchPhrase={setSearchPhrase}
      placeholder={t('haku.haehakukohde')}
      label="haku.haehakukohde"
      hiddenLabel={true}
    />
  );
};
