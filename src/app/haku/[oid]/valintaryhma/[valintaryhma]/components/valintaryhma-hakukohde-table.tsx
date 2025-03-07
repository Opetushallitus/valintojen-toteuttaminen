'use client';

import { NoResults } from '@/components/no-results';
import { ListTable } from '@/components/table/list-table';
import {
  makeColumnWithCustomRender,
  makeExternalLinkColumn,
} from '@/components/table/table-columns';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHakukohdeSortAndPaging } from '../hooks/useHakukohdeSortAndPaging';
import { TablePaginationWrapper } from '@/components/table/table-pagination-wrapper';
import { LaskentaActorRef } from '@/lib/state/laskenta-state';
import { useSelector } from '@xstate/react';
import { ErrorWithIcon } from '@/components/error-with-icon';
import { Box, Typography } from '@mui/material';

export type HakukohdeWithLink = {
  oid: string;
  name: string;
  link: string;
  laskentaValmistunut: string;
};

type ValintaryhmaHakukohdeTableProps = {
  hakukohteet: Array<HakukohdeWithLink>;
  actorRef: LaskentaActorRef;
};

const HakukohdeError = ({
  errorSummary,
}: {
  errorSummary?: {
    hakukohdeOid: string;
    tila: 'TEKEMATTA' | 'VALMIS' | 'VIRHE';
    ilmoitukset: Array<{
      otsikko: string;
      tyyppi: string;
    }>;
  };
}) => {
  return errorSummary && errorSummary.tila !== 'VALMIS' ? (
    <ErrorWithIcon key={errorSummary.hakukohdeOid}>
      {errorSummary.ilmoitukset.map((ilmoitus) => (
        <Typography key={`${errorSummary.hakukohdeOid}_${ilmoitus.otsikko}`}>
          {ilmoitus?.otsikko}
        </Typography>
      ))}
      {errorSummary.ilmoitukset.length < 1 && (
        <Typography>{errorSummary.tila}</Typography>
      )}
    </ErrorWithIcon>
  ) : (
    <></>
  );
};

export const ValintaryhmaHakukohdeTable = ({
  hakukohteet,
  actorRef,
}: ValintaryhmaHakukohdeTableProps) => {
  const { t } = useTranslations();
  const {
    results,
    sort,
    setSort,
    pageResults,
    pageSize,
    setPage,
    page,
    setPageSize,
  } = useHakukohdeSortAndPaging(hakukohteet);

  const summaryErrors = useSelector(actorRef, (s) =>
    s.context.summary?.hakukohteet.filter((hk) => hk?.tila !== 'VALMIS'),
  );

  const nameColumn = makeExternalLinkColumn<HakukohdeWithLink>({
    title: 'valintaryhmittain.hakukohteet',
    key: 'name',
    linkProp: 'link',
    nameProp: 'name',
    linkBuilder: (row) => row,
    style: { width: '65%' },
  });

  const valintalaskentaDoneColumn =
    makeColumnWithCustomRender<HakukohdeWithLink>({
      title: 'valintaryhmittain.tehty',
      key: 'laskentaValmistunut',
      renderFn: (prop) => (
        <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 1 }}>
          <Typography>{prop.laskentaValmistunut}</Typography>
          <HakukohdeError
            errorSummary={summaryErrors?.find((e) => e.hakukohdeOid)}
          />
        </Box>
      ),
    });

  const columns = [nameColumn, valintalaskentaDoneColumn];

  return results.length < 1 ? (
    <NoResults text={t('valintaryhmittain.ei-hakukohteita')} />
  ) : (
    <TablePaginationWrapper
      totalCount={results?.length ?? 0}
      pageSize={pageSize}
      setPageSize={setPageSize}
      setPageNumber={setPage}
      pageNumber={page}
      countTranslationKey="valintaryhmittain.hakukohde-maara"
    >
      <ListTable
        rowKeyProp="oid"
        columns={columns}
        rows={pageResults}
        sort={sort}
        setSort={setSort}
      />
    </TablePaginationWrapper>
  );
};
