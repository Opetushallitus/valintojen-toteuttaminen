'use client';

import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Box, Stack } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  LasketutValinnanvaiheetWithHakijaInfo,
  useLasketutValinnanVaiheet,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import React, { use } from 'react';
import {
  LaskettuValintatapajonoContent,
  LaskettuValintatapajonoContentProps,
  ValintatapajonoIlmanLaskentaaContent,
} from './components/valintatapajono-content';
import { useJonosijatSearchParams } from '@/app/hooks/useJonosijatSearch';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { downloadBlob, isEmpty } from '@/app/lib/common';
import { DownloadButton } from '@/app/components/download-button';
import useToaster from '@/app/hooks/useToaster';
import { useMutation } from '@tanstack/react-query';
import { getValintalaskennanTulosExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { NoResults } from '@/app/components/no-results';
import { SearchInput } from '@/app/components/search-input';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { groupBy } from 'remeda';

type LasketutValinnanvaiheetParams = {
  hakuOid: string;
  hakukohdeOid: string;
};

const useExcelDownloadMutation = ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async () => {
      const { fileName, blob } = await getValintalaskennanTulosExcel({
        hakukohdeOid,
      });
      downloadBlob(fileName ?? 'valintalaskennan-tulokset.xls', blob);
    },
    onError: (e) => {
      addToast({
        key: 'get-valintakoe-excel',
        message:
          'valintalaskennan-tulokset.virhe-vie-kaikki-taulukkolaskentaan',
        type: 'error',
      });
      console.error(e);
    },
  });
};

const ExcelDownloadButton = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const mutation = useExcelDownloadMutation({ hakukohdeOid });
  const { t } = useTranslations();

  return (
    <DownloadButton mutation={mutation}>
      {t('valintalaskennan-tulokset.vie-kaikki-taulukkolaskentaan')}
    </DownloadButton>
  );
};

const ValinnanvaiheGroupResults = ({
  title,
  hakukohdeOid,
  vaiheet,
  JonoContentComponent,
}: {
  title: string;
  hakukohdeOid: string;
  vaiheet?: LasketutValinnanvaiheetWithHakijaInfo;
  JonoContentComponent: React.ComponentType<LaskettuValintatapajonoContentProps>;
}) => {
  return (
    vaiheet && (
      <Stack gap={2}>
        <OphTypography variant="h2">{title}</OphTypography>
        {vaiheet?.map((vaihe) =>
          vaihe.valintatapajonot?.map((jono) => {
            return (
              <JonoContentComponent
                key={jono.oid}
                hakukohdeOid={hakukohdeOid}
                jono={jono}
                valinnanVaihe={vaihe}
              />
            );
          }),
        )}
      </Stack>
    )
  );
};

const ValinnanvaiheetContent = ({
  hakukohdeOid,
  valinnanvaiheet,
}: {
  hakukohdeOid: string;
  valinnanvaiheet: LasketutValinnanvaiheetWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  const { valinnanvaiheetIlmanLaskentaa, lasketutValinnanvaiheet } = groupBy(
    valinnanvaiheet,
    (vaihe) =>
      vaihe.createdAt
        ? 'lasketutValinnanvaiheet'
        : 'valinnanvaiheetIlmanLaskentaa',
  );

  return (
    <Stack gap={2} sx={{ width: '100%' }}>
      <ValinnanvaiheGroupResults
        title={t('valintalaskennan-tulokset.valinnanvaiheet-ilman-laskentaa')}
        hakukohdeOid={hakukohdeOid}
        vaiheet={valinnanvaiheetIlmanLaskentaa}
        JonoContentComponent={ValintatapajonoIlmanLaskentaaContent}
      />
      <ValinnanvaiheGroupResults
        title={t('valintalaskennan-tulokset.lasketut-valinnanvaiheet')}
        hakukohdeOid={hakukohdeOid}
        vaiheet={lasketutValinnanvaiheet}
        JonoContentComponent={LaskettuValintatapajonoContent}
      />
    </Stack>
  );
};

const ValintalaskennanTuloksetContent = ({
  hakuOid,
  hakukohdeOid,
}: LasketutValinnanvaiheetParams) => {
  const valinnanvaiheet = useLasketutValinnanVaiheet({
    hakuOid,
    hakukohdeOid,
  });

  const { searchPhrase, setSearchPhrase, pageSize, setPageSize } =
    useJonosijatSearchParams();
  const { t } = useTranslations();

  return isEmpty(valinnanvaiheet) ? (
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
          <ExcelDownloadButton hakukohdeOid={hakukohdeOid} />
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      <ValinnanvaiheetContent
        hakukohdeOid={hakukohdeOid}
        valinnanvaiheet={valinnanvaiheet}
      />
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
        <ValintalaskennanTuloksetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
