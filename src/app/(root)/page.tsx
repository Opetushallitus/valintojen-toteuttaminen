import { ClientLoaderFunctionArgs, replace } from 'react-router';
import { useHakuSearchResults } from '@/hooks/useHakuSearch';
import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { HakuTable } from './components/haku-table';
import { Tila } from '@/lib/kouta/kouta-types';

// Näytetään oletuksena vain julkaistut haut, ja oletus näkyy myös URL:ssa.
// Huom! Jos käyttäjä tyhjentää tila-kentän, URL-parametriksi tulee "tila=", jolloin oletusta ei aseteta.
export const clientLoader = ({ request }: ClientLoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (!url.searchParams.has('tila')) {
    url.searchParams.set('tila', Tila.JULKAISTU);
    throw replace(url.toString());
  }
  return null;
};

export default function Home() {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    results,
    pageResults,
    sort,
    setSort,
  } = useHakuSearchResults();

  return (
    <TablePaginationWrapper
      totalCount={results?.length ?? 0}
      pageNumber={page}
      setPageNumber={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      countTranslationKey="haku.haku-maara"
    >
      <HakuTable haut={pageResults} setSort={setSort} sort={sort ?? ''} />
    </TablePaginationWrapper>
  );
}
