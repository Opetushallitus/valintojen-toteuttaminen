'use client';

import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useLasketutValinnanVaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { use } from 'react';
import { ValintatapajonoContent } from './components/valintatapajono-content';
import { useJonosijatSearchParams } from '@/app/hooks/useJonosijatSearch';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { isEmpty } from '@/app/lib/common';
import { getValintalaskennanTulosExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { NoResults } from '@/app/components/no-results';
import { SearchInput } from '@/app/components/search-input';
import { FileDownloadButton } from '@/app/components/file-download-button';

type LasketutValinnanvaiheetParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const LaskennanTuloksetExcelDownloadButton = ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const { t } = useTranslations();

  return (
    <FileDownloadButton
      errorKey="get-valintalaskennan-tulos-excel-error"
      errorMessage="valintalaskennan-tulokset.virhe-vie-kaikki-taulukkolaskentaan"
      defaultFileName="valintalaskennan-tulokset.xlsx"
      getFile={() => getValintalaskennanTulosExcel({ hakukohdeOid })}
    >
      {t('valintalaskennan-tulokset.vie-kaikki-taulukkolaskentaan')}
    </FileDownloadButton>
  );
};

const LasketutValinnanVaiheetContent = ({
  hakuOid,
  hakukohdeOid,
}: LasketutValinnanvaiheetParams) => {
  const valinnanVaiheet = useLasketutValinnanVaiheet({
    hakuOid,
    hakukohdeOid,
  });

  const { searchPhrase, setSearchPhrase, pageSize, setPageSize } =
    useJonosijatSearchParams();
  const { t } = useTranslations();

  return isEmpty(valinnanVaiheet) ? (
    <NoResults text={t('valintalaskennan-tulokset.ei-tuloksia')} />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          <SearchInput
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            name="valintalaskennan-tulokset-search"
          />
          <LaskennanTuloksetExcelDownloadButton hakukohdeOid={hakukohdeOid} />
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {valinnanVaiheet.map((valinnanVaihe) =>
        valinnanVaihe.valintatapajonot?.map((jono) => {
          return (
            <ValintatapajonoContent
              key={jono.oid}
              hakukohdeOid={hakukohdeOid}
              jono={jono}
              valinnanVaihe={valinnanVaihe}
            />
          );
        }),
      )}
    </Box>
  );
};

export default function ValintalaskennanTuloksetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <LasketutValinnanVaiheetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
