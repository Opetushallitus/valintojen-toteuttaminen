'use client';

import { TabContainer } from '../tab-container';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import {
  Button,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ValintalaskennanTulosTable } from './valintalaskennan-tulos-table';
import { useLasketutValinnanVaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import {
  useJonosijatSearch,
  useJonosijatSearchParams,
} from '@/app/hooks/useJonosijatSearch';
import { JonoSijaWithHakijaInfo } from '@/app/lib/valintalaskenta-service';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { Typography } from '@opetushallitus/oph-design-system';
import ValintalaskennanTulosSearch from './valintalaskennan-tulos-search';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { ExpandMore, SaveAlt } from '@mui/icons-material';
import { configuration } from '@/app/lib/configuration';
import React from 'react';

type LasketutValinnanvaiheetParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const ValintatapaJonoContent = ({
  jonoId,
  jono,
}: {
  jonoId: string;
  jono: Array<JonoSijaWithHakijaInfo>;
}) => {
  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useJonosijatSearch(jonoId, jono);

  return (
    <TablePaginationWrapper
      totalCount={results?.length ?? 0}
      countTranslationKey="jonosijat.maara"
      pageSize={pageSize}
      setPageNumber={setPage}
      pageNumber={page}
      countHidden={true}
    >
      <ValintalaskennanTulosTable
        setSort={setSort}
        sort={sort}
        jonoId={jonoId}
        jonosijat={pageResults}
      />
    </TablePaginationWrapper>
  );
};

const AccordionBlock = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  const headerId = `${title}-accordion-header`;
  const contentId = `${title}-accordion-content`;

  return (
    <Accordion
      defaultExpanded={true}
      sx={{
        border: DEFAULT_BOX_BORDER,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls={contentId}
        id={headerId}
      >
        <Typography variant="h2" component="h3">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          borderTop: DEFAULT_BOX_BORDER,
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

const getJonoNimi = ({
  valinnanVaiheNimi,
  jonoNimi,
}: {
  valinnanVaiheNimi: string;
  jonoNimi: string;
}) => {
  return jonoNimi.includes(valinnanVaiheNimi)
    ? jonoNimi
    : `${valinnanVaiheNimi}: ${jonoNimi}`;
};

const LasketutValinnanVaiheetContent = ({
  hakuOid,
  hakukohdeOid,
}: LasketutValinnanvaiheetParams) => {
  const valinnanVaiheet = useLasketutValinnanVaiheet({
    hakuOid,
    hakukohdeOid,
  });

  const { pageSize, setPageSize } = useJonosijatSearchParams();
  const { t } = useTranslations();

  return (
    <Box
      display="flex"
      flexDirection="column"
      rowGap={2}
      alignItems="flex-start"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        width="100%"
        gap={2}
      >
        <Box display="flex" alignItems="flex-end" gap={2}>
          <ValintalaskennanTulosSearch />
          <Button
            variant="text"
            download
            startIcon={<SaveAlt />}
            href={`${configuration.valintalaskennanTulosExcelUrl({ hakukohdeOid })}`}
          >
            {t('valintalaskennan-tulos.vie-kaikki-taulukkolaskentaan')}
          </Button>
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {valinnanVaiheet.map((valinnanVaihe) =>
        valinnanVaihe.valintatapajonot?.map((jono) => {
          return (
            <Box key={valinnanVaihe.valinnanvaiheoid} width="100%">
              <AccordionBlock
                title={getJonoNimi({
                  valinnanVaiheNimi: valinnanVaihe.nimi,
                  jonoNimi: jono.nimi,
                })}
              >
                <ValintatapaJonoContent
                  jonoId={jono.valintatapajonooid}
                  jono={jono.jonosijat}
                />
              </AccordionBlock>
            </Box>
          );
        }),
      )}
    </Box>
  );
};

export default function ValintalaskennanTulosPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  const { t } = useTranslations();

  return (
    <TabContainer>
      <QuerySuspenseBoundary
        suspenseFallback={
          <CircularProgress aria-label={t('yleinen.ladataan')} />
        }
      >
        <LasketutValinnanVaiheetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
