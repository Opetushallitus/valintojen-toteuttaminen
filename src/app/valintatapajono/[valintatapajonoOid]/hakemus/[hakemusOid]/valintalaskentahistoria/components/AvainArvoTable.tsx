import { ListTable } from '@/components/table/list-table';
import { makeGenericColumn } from '@/components/table/table-columns';
import { ListTableColumn } from '@/components/table/table-types';
import { NoResults } from '@/components/no-results';
import { Box } from '@mui/material';
import { ophColors } from '@/lib/theme';

export type AvainArvoRow = {
  id: string;
  avain: string;
  arvo: string;
  // Vain arvot-taulukossa: nimetyn arvon funktio (Nimetty lukuarvo / Nimetty totuusarvo),
  // järjestyskriteerit, joissa arvo esiintyy, ja nimetyn arvon muut avaimet
  tyyppi?: string;
  jarjestyskriteerit?: string;
  muutAvaimet?: Array<[string, unknown]>;
};

// Sarakkeiden otsikot ovat käännösavaimia. Leveys pitää antaa kaikille paitsi viimeiselle sarakkeelle,
// koska kiinteässä asettelussa otsikon ja rungon sarakkeet ovat yhtä leveät vain annetuilla leveyksillä.
export const makeAvainColumn = (title: string, width: string) =>
  makeGenericColumn<AvainArvoRow>({
    title,
    key: 'avain',
    valueProp: 'avain',
    style: { fontWeight: 600, width },
  });

export const makeArvoColumn = (title: string, width = 'auto') =>
  makeGenericColumn<AvainArvoRow>({
    title,
    key: 'arvo',
    valueProp: 'arvo',
    style: { width },
  });

export const AvainArvoTable = ({
  rows,
  columns,
  emptyText,
}: {
  rows: Array<AvainArvoRow>;
  columns: Array<ListTableColumn<AvainArvoRow>>;
  emptyText: string;
}) =>
  rows.length === 0 ? (
    // Täysleveä kääre, jotta placeholder rivittyy painikerivillä omalle rivilleen
    <Box sx={{ width: '100%' }}>
      <NoResults text={emptyText} />
    </Box>
  ) : (
    <ListTable
      rowKeyProp="id"
      columns={columns}
      rows={rows}
      sx={{
        // Vain taulukon runkoa vieritetään, joten otsikkorivi pysyy näkyvissä eikä vierityspalkki ulotu sen kohdalle.
        // Rivit ovat omia kiinteän asettelun taulukoitaan, jotta sarakkeet pysyvät kohdakkain otsikon kanssa.
        '& .MuiTableRow-root': {
          display: 'table',
          width: '100%',
          tableLayout: 'fixed',
        },
        '& .MuiTableHead-root': {
          display: 'block',
          // Varataan otsikkoon vierityspalkin levyinen tila, jotta sarakkeet osuvat rungon sarakkeiden kohdalle
          overflow: 'hidden',
          scrollbarGutter: 'stable',
          backgroundColor: ophColors.white,
        },
        '& .MuiTableBody-root': {
          display: 'block',
          maxHeight: '600px',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        },
        '& .MuiTableBody-root .MuiTableCell-root': {
          height: 'auto',
          // Kiinteässä asettelussa pitkät arvot pitää rivittää, etteivät ne valu viereiseen sarakkeeseen
          overflowWrap: 'anywhere',
        },
      }}
    />
  );
