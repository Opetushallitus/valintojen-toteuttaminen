'use client';
import { Box } from '@mui/material';
import { useSijoittelunTulosSearch } from '../hooks/useSijoittelunTuloksetSearch';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { useTranslations } from '@/app/hooks/useTranslations';
import { AccordionBox } from '@/app/components/accordion-box';
import { SijoitteluajonValintatapajonoEnriched } from '@/app/lib/types/sijoittelu-types';
import { SijoittelunTulosAccordionTitle } from './sijoittelun-tulos-accordion-title';
import { SijoittelunTulosTable } from './sijoittelun-tulos-table';
import { Haku } from '@/app/lib/types/kouta-types';

export const SijoittelunTulosContent = ({
  valintatapajono,
  haku,
}: {
  valintatapajono: SijoitteluajonValintatapajonoEnriched;
  haku: Haku;
}) => {
  const { t } = useTranslations();

  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useSijoittelunTulosSearch(valintatapajono.oid, valintatapajono.hakemukset);

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        id={valintatapajono.oid}
        title={
          <SijoittelunTulosAccordionTitle
            valintatapajono={valintatapajono}
            haku={haku}
          />
        }
      >
        <TablePaginationWrapper
          label={`${t('yleinen.sivutus')} ${valintatapajono.nimi}`}
          totalCount={results?.length ?? 0}
          pageSize={pageSize}
          setPageNumber={setPage}
          pageNumber={page}
          countHidden={true}
        >
          <SijoittelunTulosTable
            haku={haku}
            hakemukset={pageResults}
            sort={sort}
            setSort={setSort}
          />
        </TablePaginationWrapper>
      </AccordionBox>
    </Box>
  );
};
