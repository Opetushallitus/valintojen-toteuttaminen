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
import { isEmpty } from '@/app/lib/common';
import { getValintalaskennanTulosExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { NoResults } from '@/app/components/no-results';
import { SearchInput } from '@/app/components/search-input';
import { FileDownloadButton } from '@/app/components/file-download-button';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { groupBy } from 'remeda';
import { Haku } from '@/app/lib/types/kouta-types';
import { useHaku } from '@/app/hooks/useHaku';

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

const ValinnanvaiheGroupResults = ({
  title,
  hakukohdeOid,
  haku,
  vaiheet,
  JonoContentComponent,
}: {
  title: string;
  haku: Haku;
  hakukohdeOid: string;
  vaiheet?: LasketutValinnanvaiheetWithHakijaInfo;
  JonoContentComponent: React.ComponentType<LaskettuValintatapajonoContentProps>;
}) => {
  return (
    vaiheet && (
      <Stack gap={2}>
        <OphTypography component="h3" variant="h2">
          {title}
        </OphTypography>
        {vaiheet?.map((vaihe) =>
          vaihe.valintatapajonot?.map((jono) => {
            return (
              <JonoContentComponent
                key={jono.oid}
                haku={haku}
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
  haku,
  valinnanvaiheet,
}: {
  hakukohdeOid: string;
  haku: Haku;
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
        haku={haku}
        hakukohdeOid={hakukohdeOid}
        vaiheet={valinnanvaiheetIlmanLaskentaa}
        JonoContentComponent={ValintatapajonoIlmanLaskentaaContent}
      />
      <ValinnanvaiheGroupResults
        title={t('valintalaskennan-tulokset.lasketut-valinnanvaiheet')}
        haku={haku}
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

  const { data: haku } = useHaku({ hakuOid });

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
          <LaskennanTuloksetExcelDownloadButton hakukohdeOid={hakukohdeOid} />
        </Box>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      <ValinnanvaiheetContent
        haku={haku}
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
