import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useRequiredParams } from '@/hooks/useRequiredParams';
import { queryOptionsGetHakijat } from '@/lib/ataru/ataru-queries';
import {
  buildLinkToApplication,
  buildLinkToHaku,
} from '@/lib/ataru/ataru-service';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHaku } from '@/lib/kouta/useHaku';
import { Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

const HakuInfo = ({ hakuOid }: { hakuOid: string }) => {
  const { t, translateEntity } = useTranslations();
  const { data: haku } = useHaku({ hakuOid });

  return (
    <Stack direction="row" spacing="4vw" sx={{ paddingTop: 1 }}>
      <LabeledInfoItem
        label={t('yleinen.haku')}
        value={
          <ExternalLink
            name={translateEntity(haku.nimi)}
            href={buildLinkToHaku(hakuOid)}
            noIcon={true}
          />
        }
      />
      <LabeledInfoItem label={t('yleinen.haun-tunniste')} value={haku.oid} />
    </Stack>
  );
};

const ValintalaskentahistoriaContent = ({
  hakemusOid,
}: {
  hakemusOid: string;
}) => {
  const { t } = useTranslations();
  const { data: hakijat } = useSuspenseQuery(
    queryOptionsGetHakijat({
      hakemusOids: [hakemusOid],
    }),
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
      </>
    )
  );
};

export default function ValintalaskentahistoriaPage() {
  const { hakemusOid } = useRequiredParams<{
    valintatapajonoOid: string;
    hakemusOid: string;
  }>();

  return (
    <Stack spacing={2}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintalaskentahistoriaContent hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
