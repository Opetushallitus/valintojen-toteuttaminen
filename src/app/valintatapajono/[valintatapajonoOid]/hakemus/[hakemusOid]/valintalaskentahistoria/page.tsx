import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useRequiredParams } from '@/hooks/useRequiredParams';
import { queryOptionsGetHakijat } from '@/lib/ataru/ataru-queries';
import { buildLinkToApplication } from '@/lib/externalLinks';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  queryOptionsGetHakemuksenValintalaskennanTulokset,
  queryOptionsGetValintalaskentahistoria,
} from '@/lib/valintalaskenta/valintalaskenta-queries';
import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import { Stack, Typography } from '@mui/material';
import { NoResults } from '@/components/no-results';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { TarjontaInfo } from './components/TarjontaInfo';
import { HistorianAvaimetJaArvot } from './components/HistorianAvaimetJaArvot';
import { JarjestyskriteeriTabs } from './components/JarjestyskriteeriTabs';
import { findJononHakukohdeJaValinnanvaihe } from './lib/valintalaskentahistoriaUtils';

const ValintalaskentahistoriaContent = ({
  valintatapajonoOid,
  hakemusOid,
}: {
  valintatapajonoOid: string;
  hakemusOid: string;
}) => {
  const { t } = useTranslations();
  const [{ data: hakijat }, { data: historiat }] = useSuspenseQueries({
    queries: [
      queryOptionsGetHakijat({
        hakemusOids: [hakemusOid],
      }),
      queryOptionsGetValintalaskentahistoria({
        valintatapajonoOid,
        hakemusOid,
      }),
    ],
  });

  const hakija = hakijat?.[0];
  const hakuOid = hakija?.hakuOid;

  if (!hakija) {
    return (
      <NoResults
        text={t('valintalaskentahistoria.hakemusta-ei-loytynyt', {
          oid: hakemusOid,
        })}
      />
    );
  }

  return (
    <>
      <Typography variant="h2">
        {t('valintalaskentahistoria.historia-otsikko')}{' '}
        <ExternalLink
          name={hakemusOid}
          href={buildLinkToApplication(hakemusOid)}
          noIcon={true}
          underline="always"
        />{' '}
        ({hakija.hakijanNimi})
      </Typography>
      {hakuOid && (
        <HakemuksenHistoria
          hakuOid={hakuOid}
          hakemusOid={hakemusOid}
          valintatapajonoOid={valintatapajonoOid}
          historiat={historiat}
        />
      )}
    </>
  );
};

const HakemuksenHistoria = ({
  hakuOid,
  hakemusOid,
  valintatapajonoOid,
  historiat,
}: {
  hakuOid: string;
  hakemusOid: string;
  valintatapajonoOid: string;
  historiat: Array<Valintalaskentahistoria>;
}) => {
  const { t } = useTranslations();
  // Sivun osoitteessa on vain valintatapajono, joten sen hakukohde ja valinnanvaihe etsitään
  // hakemuksen valintalaskennan tuloksista
  const { data: valintalaskennanTulokset } = useSuspenseQuery(
    queryOptionsGetHakemuksenValintalaskennanTulokset({ hakuOid, hakemusOid }),
  );
  const jononSijainti = findJononHakukohdeJaValinnanvaihe(
    valintalaskennanTulokset,
    valintatapajonoOid,
  );

  return (
    <>
      <TarjontaInfo
        hakuOid={hakuOid}
        hakukohdeOid={jononSijainti?.hakukohdeOid}
      />
      {historiat.length > 0 ? (
        <>
          <HistorianAvaimetJaArvot historiat={historiat} />
          <JarjestyskriteeriTabs
            valintatapajonoOid={valintatapajonoOid}
            jononSijainti={jononSijainti}
            historiat={historiat}
          />
        </>
      ) : (
        <NoResults
          text={t('valintalaskentahistoria.historiaa-ei-loytynyt', {
            valintatapajonoOid,
          })}
        />
      )}
    </>
  );
};

export default function ValintalaskentahistoriaPage() {
  const { valintatapajonoOid, hakemusOid } = useRequiredParams<{
    valintatapajonoOid: string;
    hakemusOid: string;
  }>();

  return (
    <Stack spacing={2}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintalaskentahistoriaContent
          valintatapajonoOid={valintatapajonoOid}
          hakemusOid={hakemusOid}
        />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
