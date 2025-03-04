'use client';
import { Box } from '@mui/material';
import { HakukohteenHakijaryhma } from '@/lib/types/laskenta-types';
import { HakijaryhmaAccordionTitle } from './hakijaryhma-accordion-title';
import { HakijaryhmaTable } from './hakijaryhma-table';
import { useHakijaryhmatSearch } from '../hooks/useHakijaryhmatSearch';
import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { useTranslations } from '@/lib/localization/useTranslations';
import { AccordionBox } from '@/components/accordion-box';

export const HakijaryhmaContent = ({
  hakijaryhma,
}: {
  hakijaryhma: HakukohteenHakijaryhma;
}) => {
  const { t } = useTranslations();

  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useHakijaryhmatSearch(hakijaryhma.oid, hakijaryhma.hakijat);

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        id={hakijaryhma.oid}
        title={<HakijaryhmaAccordionTitle hakijaryhma={hakijaryhma} />}
      >
        <TablePaginationWrapper
          label={`${t('yleinen.sivutus')} ${t('hakijaryhmat.taulukko.otsikko')}: ${hakijaryhma.nimi}`}
          totalCount={results?.length ?? 0}
          pageSize={pageSize}
          setPageNumber={setPage}
          pageNumber={page}
          countHidden={true}
        >
          <HakijaryhmaTable
            hakijat={pageResults}
            sort={sort}
            setSort={setSort}
          />
        </TablePaginationWrapper>
      </AccordionBox>
    </Box>
  );
};
