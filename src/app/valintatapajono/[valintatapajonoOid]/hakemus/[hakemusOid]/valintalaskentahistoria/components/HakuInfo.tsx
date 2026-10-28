import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { buildLinkToHaku } from '@/lib/ataru/ataru-service';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHaku } from '@/lib/kouta/useHaku';
import { Stack } from '@mui/material';

export const HakuInfo = ({ hakuOid }: { hakuOid: string }) => {
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
