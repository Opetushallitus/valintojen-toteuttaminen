'use client';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHenkiloSearchParams } from '../hooks/useHenkiloSearch';
import { SearchInput } from '@/components/search-input';

export const HenkiloSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHenkiloSearchParams();
  const { t } = useTranslations();

  return (
    <SearchInput
      sx={{
        paddingRight: 2,
        flexBasis: 'auto',
      }}
      name="henkilo-search"
      helperText={t('henkilo.hae-helpertext')}
      searchPhrase={searchPhrase}
      setSearchPhrase={setSearchPhrase}
      placeholder={t('henkilo.hae-henkilo')}
      label="henkilo.hae-henkilo"
      hiddenLabel={true}
    />
  );
};
