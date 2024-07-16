'use client';

import { TabContainer } from '../tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Button, Box } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useLasketutValinnanVaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { ValintalaskennanTulosSearch } from './valintalaskennan-tulos-search';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { FileDownloadOutlined } from '@mui/icons-material';
import { configuration } from '@/app/lib/configuration';
import React from 'react';
import { ValintatapajonoContent } from './valintatapajono-content';
import { useJonosijatSearchParams } from '@/app/hooks/useJonosijatSearch';
import { ClientSpinner } from '@/app/components/client-spinner';

type LasketutValinnanvaiheetParams = {
  hakuOid: string;
  hakukohdeOid: string;
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
            startIcon={<FileDownloadOutlined />}
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

export default function ValintalaskennanTulosPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <LasketutValinnanVaiheetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
