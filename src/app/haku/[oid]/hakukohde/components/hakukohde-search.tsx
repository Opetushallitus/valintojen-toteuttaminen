import { SearchInput } from '@/components/search-input';
import { useHakukohdeSearchParams } from '@/hooks/useHakukohdeSearch';
import { useTranslations } from '@/lib/localization/useTranslations';

export const HakukohdeSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHakukohdeSearchParams();
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
