'use client';

import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { AccordionBox } from '@/app/components/accordion-box';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useValintakoekutsut } from '@/app/hooks/useValintakoekutsut';
import { ValintakoekutsutTable } from './components/valintakoekutsut-table';
import {
  ryhmittelyParser,
  useValintakoekutsutGlobalSearchParams,
  useValintakoekutsutPaginated,
} from './hooks/useValintakoekutsutPaginated';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { entries, isEmpty, map, pipe } from 'remeda';
import { AccordionBoxTitle } from '@/app/components/accordion-box-title';
import {
  Ryhmittely,
  ValintakoeKutsuItem,
} from '@/app/lib/types/valintakoekutsut-types';
import { NoResults } from '@/app/components/no-results';

type ValintakoekutsutContentProps = {
  hakuOid: string;
  hakukohdeOid: string;
};

const PaginatedValintakoekutsut = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  valintakoeKutsut,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: string;
  valintakoeKutsut: Array<ValintakoeKutsuItem>;
}) => {
  const { results, sort, setSort, pageSize, setPage, page } =
    useValintakoekutsutPaginated(valintakoeTunniste, valintakoeKutsut);

  const { t } = useTranslations();

  return isEmpty(valintakoeKutsut) ? (
    <NoResults text={t('valintakoekutsut.ei-valintakoekutsuja')} />
  ) : (
    <ValintakoekutsutTable
      valintakoeTunniste={valintakoeTunniste}
      hakuOid={hakuOid}
      hakukohdeOid={hakukohdeOid}
      data={results}
      sort={sort}
      setSort={setSort}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
    />
  );
};

const ValintakoeKutsutWrapper = ({
  hakuOid,
  hakukohdeOid,
  vainKutsuttavat,
  ryhmittely,
}: {
  vainKutsuttavat: boolean;
  ryhmittely: Ryhmittely;
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const valintakoekutsutByTunniste = useValintakoekutsut({
    hakuOid,
    hakukohdeOid,
    ryhmittely,
    vainKutsuttavat,
  });
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
      }}
    >
      {ryhmittely === 'hakijoittain' ? (
        'TODO: Hakijoittain ryhmittely'
      ) : isEmpty(valintakoekutsutByTunniste) ? (
        <NoResults text={t('valintakoekutsut.ei-valintakokeita')} />
      ) : (
        pipe(
          entries(valintakoekutsutByTunniste),
          map(([valintakoeTunniste, valintakoeKutsut]) => {
            const { nimi, kutsut } = valintakoeKutsut;
            return (
              <AccordionBox
                key={valintakoeTunniste}
                id="valintakoekutsu"
                title={<AccordionBoxTitle title={nimi ?? valintakoeTunniste} />}
              >
                <PaginatedValintakoekutsut
                  key={valintakoeTunniste}
                  hakuOid={hakuOid}
                  hakukohdeOid={hakukohdeOid}
                  valintakoeTunniste={valintakoeTunniste}
                  valintakoeKutsut={kutsut}
                />
              </AccordionBox>
            );
          }),
        )
      )}
    </Box>
  );
};

const parseRyhmittely = (ryhmittelyStr: string) =>
  ryhmittelyParser.parse(ryhmittelyStr);

function ValintakoekutsutContent({
  hakuOid,
  hakukohdeOid,
}: ValintakoekutsutContentProps) {
  const { t } = useTranslations();

  const {
    ryhmittely,
    setRyhmittely,
    vainKutsuttavat,
    setVainKutsuttavat,
    pageSize,
    setPageSize,
  } = useValintakoekutsutGlobalSearchParams();

  const handleRyhmittelyChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRyhmittely: string,
  ) => {
    setRyhmittely(parseRyhmittely(newRyhmittely));
  };

  const handleVainKutsuttavatChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setVainKutsuttavat(event.target.checked);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 1,
          }}
        >
          <FormControl component="fieldset">
            <FormLabel component="legend">
              {t('valintakoekutsut.nayta')}
            </FormLabel>
            <FormGroup
              row
              sx={{
                display: 'flex',
                flexDirection: 'row',
                columnGap: 2,
                width: '100%',
              }}
            >
              <ToggleButtonGroup
                color="primary"
                value={ryhmittely}
                onChange={handleRyhmittelyChange}
                exclusive
              >
                <ToggleButton value="kokeittain">
                  {t('valintakoekutsut.kokeittain')}
                </ToggleButton>
                <ToggleButton value="hakijoittain">
                  {t('valintakoekutsut.hakijoittain')}
                </ToggleButton>
              </ToggleButtonGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={vainKutsuttavat}
                    onChange={handleVainKutsuttavatChange}
                  />
                }
                label={t('valintakoekutsut.vain-kutsuttavat')}
              />
            </FormGroup>
          </FormControl>
          <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
        </Box>
        <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
          <ValintakoeKutsutWrapper
            hakuOid={hakuOid}
            hakukohdeOid={hakukohdeOid}
            vainKutsuttavat={vainKutsuttavat}
            ryhmittely={ryhmittely}
          />
        </QuerySuspenseBoundary>
      </Box>
    </Box>
  );
}

export default function ValintakoekutsutPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintakoekutsutContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
