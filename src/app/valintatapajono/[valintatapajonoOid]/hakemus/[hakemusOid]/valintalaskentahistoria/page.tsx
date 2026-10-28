import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useRequiredParams } from '@/hooks/useRequiredParams';
import { queryOptionsGetHakijat } from '@/lib/ataru/ataru-queries';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { useTranslations } from '@/lib/localization/useTranslations';
import { queryOptionsGetValintalaskentahistoria } from '@/lib/valintalaskenta/valintalaskenta-queries';
import { Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { HakuInfo } from './components/HakuInfo';
import { HistorianAvaimetJaArvot } from './components/HistorianAvaimetJaArvot';
import { JarjestyskriteeriTabs } from './components/JarjestyskriteeriTabs';

const ValintalaskentahistoriaContent = ({
  valintatapajonoOid,
  hakemusOid,
}: {
  valintatapajonoOid: string;
  hakemusOid: string;
}) => {
  const { t } = useTranslations();
  const { data: hakijat } = useSuspenseQuery(
    queryOptionsGetHakijat({
      hakemusOids: [hakemusOid],
    }),
  );
  const { data: historiat } = useSuspenseQuery(
    queryOptionsGetValintalaskentahistoria({ valintatapajonoOid, hakemusOid }),
  );

  const hakija = hakijat?.[0];
  const hakuOid = hakija?.hakuOid;

  return (
    hakija && (
      <>
        <Typography variant="h2">
          {t('valintalaskentahistoria.historia-otsikko')}{' '}
          <ExternalLink
            name={hakemusOid}
            href={buildLinkToApplication(hakemusOid)}
            noIcon={true}
          />{' '}
          ({hakija.hakijanNimi})
        </Typography>
        {hakuOid && <HakuInfo hakuOid={hakija.hakuOid} />}
        {historiat.length > 0 && (
          <>
            <HistorianAvaimetJaArvot historiat={historiat} />
            <JarjestyskriteeriTabs
              hakuOid={hakija.hakuOid}
              hakemusOid={hakemusOid}
              valintatapajonoOid={valintatapajonoOid}
              historiat={historiat}
            />
          </>
        )}
      </>
    )
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
