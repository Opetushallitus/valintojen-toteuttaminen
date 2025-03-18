'use client';
import { use } from 'react';

import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/components/client-spinner';
import { AccordionBox } from '@/components/accordion-box';
import {
  Box,
  FormControl,
  FormGroup,
  FormLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  useValintakoekutsutHakijoittain,
  useValintakoekutsutKokeittain,
} from '@/hooks/useValintakoekutsut';
import { ValintakoekutsutKokeittainTable } from './components/valintakoekutsut-kokeittain-table';
import {
  ryhmittelyParser,
  useValintakoekutsutGlobalSearchParams,
  useValintakoekutsutPaginated,
} from './hooks/useValintakoekutsutPaginated';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import { entries, isEmpty, map, pipe } from 'remeda';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { ValintakoeKutsuItem } from '@/lib/types/valintakoekutsut-types';
import { NoResults } from '@/components/no-results';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { ValintakoekutsutHakijoittainTable } from './components/valintakoekutsut-hakijoittain-table';
import { FormBox } from '@/components/form-box';
import { ValintakoekutsutExcelDownloadButton } from './components/valintakoekutsut-excel-download-button';

type ValintakoekutsutContentProps = {
  hakuOid: string;
  hakukohdeOid: string;
};

const PaginatedValintakoekutsut = ({
  hakuOid,
  hakukohdeOid,
  valintakoeTunniste,
  valintakoeNimi,
  valintakoeKutsut,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: string;
  valintakoeNimi: string;
  valintakoeKutsut: Array<ValintakoeKutsuItem>;
}) => {
  const { results, sort, setSort, pageSize, setPage, page } =
    useValintakoekutsutPaginated(valintakoeNimi, valintakoeKutsut);

  const { t } = useTranslations();

  return isEmpty(valintakoeKutsut) ? (
    <NoResults text={t('valintakoekutsut.ei-valintakoekutsuja')} />
  ) : (
    <ValintakoekutsutKokeittainTable
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

const ValintakoekutsutHakijoittain = ({
  hakuOid,
  hakukohdeOid,
  vainKutsuttavat,
}: {
  vainKutsuttavat: boolean;
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const valintakoekutsutHakijoittain = useValintakoekutsutHakijoittain({
    hakuOid,
    hakukohdeOid,
    vainKutsuttavat,
  });

  const { results, sort, setSort, pageSize, setPage, page } =
    useValintakoekutsutPaginated(
      'valintakoekutsut',
      valintakoekutsutHakijoittain.hakijat,
    );

  const { t } = useTranslations();

  return isEmpty(valintakoekutsutHakijoittain?.kokeet) ||
    isEmpty(valintakoekutsutHakijoittain?.hakijat) ? (
    <NoResults text={t('valintakoekutsut.ei-valintakoekutsuja')} />
  ) : (
    <FormBox>
      <ValintakoekutsutExcelDownloadButton
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        valintakoeTunniste={valintakoekutsutHakijoittain.kokeet.map(
          (k) => k.selvitettyTunniste,
        )}
      />
      <ValintakoekutsutHakijoittainTable
        data={results}
        sort={sort}
        kokeet={valintakoekutsutHakijoittain.kokeet}
        setSort={setSort}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
      />
    </FormBox>
  );
};

const ValintakoekutsutKokeittain = ({
  hakuOid,
  hakukohdeOid,
  vainKutsuttavat,
}: {
  vainKutsuttavat: boolean;
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const valintakoekutsutKokeittain = useValintakoekutsutKokeittain({
    hakuOid,
    hakukohdeOid,
    vainKutsuttavat,
  });
  const { t } = useTranslations();

  return (
    <Stack spacing={2}>
      {isEmpty(valintakoekutsutKokeittain) ? (
        <NoResults text={t('valintakoekutsut.ei-valintakokeita')} />
      ) : (
        pipe(
          entries(valintakoekutsutKokeittain),
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
                  valintakoeNimi={nimi}
                  valintakoeKutsut={kutsut}
                />
              </AccordionBox>
            );
          }),
        )
      )}
    </Stack>
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
    <Stack>
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
              gap: 2,
              flexWrap: 'nowrap',
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
            <OphCheckbox
              checked={vainKutsuttavat}
              onChange={handleVainKutsuttavatChange}
              label={t('valintakoekutsut.vain-kutsuttavat')}
            />
          </FormGroup>
        </FormControl>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        {ryhmittely === 'kokeittain' ? (
          <ValintakoekutsutKokeittain
            hakuOid={hakuOid}
            hakukohdeOid={hakukohdeOid}
            vainKutsuttavat={vainKutsuttavat}
          />
        ) : (
          <ValintakoekutsutHakijoittain
            hakuOid={hakuOid}
            hakukohdeOid={hakukohdeOid}
            vainKutsuttavat={vainKutsuttavat}
          />
        )}
      </QuerySuspenseBoundary>
    </Stack>
  );
}

export default function ValintakoekutsutPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
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
