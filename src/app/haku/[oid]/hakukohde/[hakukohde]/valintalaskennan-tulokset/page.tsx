'use client';

import { TabContainer } from '../components/tab-container';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box, Stack } from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  LaskennanValinnanvaiheetWithHakijaInfo,
  useEditableValintalaskennanTulokset,
} from '@/hooks/useEditableValintalaskennanTulokset';
import { PageSizeSelector } from '@/components/table/page-size-selector';
import React, { use } from 'react';
import { LaskennatonValintatapajonoContent } from './components/laskennaton-valintatapajono-content';
import { useJonoTuloksetSearchParams } from '@/hooks/useJonoTuloksetSearch';
import { FullClientSpinner } from '@/components/client-spinner';
import { isEmpty } from '@/lib/common';
import { getValintalaskennanTulosExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { NoResults } from '@/components/no-results';
import { SearchInput } from '@/components/search-input';
import { FileDownloadButton } from '@/components/file-download-button';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { groupBy } from 'remeda';
import { Haku, KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useHaku } from '@/lib/kouta/useHaku';
import { LaskettuValintatapajonoContent } from './components/laskettu-valintatapajono-content';
import { ValintatapajonoContentProps } from './types/valintatapajono-types';
import { AccordionBox } from '@/components/accordion-box';
import { ValintatapajonoAccordionTitle } from './components/valintatapajono-accordion-title';

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
  vaiheet?: LaskennanValinnanvaiheetWithHakijaInfo;
  JonoContentComponent: React.ComponentType<ValintatapajonoContentProps>;
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
              <Box
                key={jono.oid}
                sx={{
                  width: '100%',
                }}
              >
                <AccordionBox
                  headingComponent="h4"
                  id={vaihe.valinnanvaiheoid}
                  title={
                    <ValintatapajonoAccordionTitle
                      valinnanVaihe={vaihe}
                      jono={jono}
                    />
                  }
                >
                  <JonoContentComponent
                    key={jono.oid}
                    haku={haku}
                    hakukohdeOid={hakukohdeOid}
                    jono={jono}
                    valinnanVaihe={vaihe}
                  />
                </AccordionBox>
              </Box>
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
  valinnanvaiheet: LaskennanValinnanvaiheetWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  const { lasketutValinnanvaiheet, valinnanvaiheetIlmanLaskentaa } = groupBy(
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
        JonoContentComponent={LaskennatonValintatapajonoContent}
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
}: KoutaOidParams) => {
  const valinnanvaiheet = useEditableValintalaskennanTulokset({
    hakuOid,
    hakukohdeOid,
  });

  const { data: haku } = useHaku({ hakuOid });

  const { searchPhrase, setSearchPhrase, pageSize, setPageSize } =
    useJonoTuloksetSearchParams();
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
