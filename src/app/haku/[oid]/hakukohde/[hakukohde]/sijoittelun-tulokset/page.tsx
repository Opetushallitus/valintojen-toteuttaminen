'use client';
import { use } from 'react';

import { TabContainer } from '../components/tab-container';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys } from '@/app/lib/valinta-tulos-service';
import { isEmpty } from '@/app/lib/common';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { NoResults } from '@/app/components/no-results';
import { useSijoittelunTulosSearchParams } from './hooks/useSijoittelunTuloksetSearch';
import { SijoittelunTulosContent } from './components/sijoittelun-tulos-content';
import { SijoittelunTulosControls } from './components/sijoittelun-tulos-controls';
import { useHaku } from '@/app/hooks/useHaku';
import { useHaunAsetukset } from '@/app/hooks/useHaunAsetukset';
import { Haku } from '@/app/lib/types/kouta-types';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { canHakuBePublished } from '@/app/lib/sijoittelun-tulokset-utils';

type SijoitteluContentParams = {
  haku: Haku;
  hakukohdeOid: string;
  haunAsetukset: HaunAsetukset;
};

const SijoitteluContent = ({
  haku,
  hakukohdeOid,
  haunAsetukset,
}: SijoitteluContentParams) => {
  const { t } = useTranslations();

  const { pageSize, setPageSize } = useSijoittelunTulosSearchParams();

  const { data: tulokset } = useSuspenseQuery({
    queryKey: [
      'tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys',
      haku.oid,
      hakukohdeOid,
    ],
    queryFn: () =>
      tryToGetLatestSijoitteluajonTuloksetWithValintaEsitys(
        haku.oid,
        hakukohdeOid,
      ),
  });

  const { data: permissions } = useUserPermissions();

  return isEmpty(tulokset) ? (
    <NoResults text={t('sijoittelun-tulokset.ei-tuloksia')} />
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
        <SijoittelunTulosControls haku={haku} />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      {tulokset &&
        tulokset.valintatapajonot.map((jono) => (
          <SijoittelunTulosContent
            valintatapajono={jono}
            key={jono.oid}
            haku={haku}
            hakukohdeOid={hakukohdeOid}
            lastModified={tulokset.lastModified}
            publishAllowed={
              permissions.admin || canHakuBePublished(haku, haunAsetukset)
            }
          />
        ))}
    </Box>
  );
};

export default function SijoittelunTuloksetPage(props: {
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = use(props.params);
  const { data: haku } = useHaku({ hakuOid: params.oid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid: params.oid });

  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <SijoitteluContent
          haku={haku}
          hakukohdeOid={params.hakukohde}
          haunAsetukset={haunAsetukset}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
