import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { buildLinkToHaku, buildLinkToHakukohde } from '@/lib/externalLinks';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHaku } from '@/lib/kouta/useHaku';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { Stack } from '@mui/material';

const HakuInfo = ({ hakuOid }: { hakuOid: string }) => {
  const { t, translateEntity } = useTranslations();
  const { data: haku } = useHaku({ hakuOid });

  return (
    <>
      <LabeledInfoItem
        label={t('yleinen.haku')}
        value={
          <ExternalLink
            name={translateEntity(haku.nimi)}
            href={buildLinkToHaku(hakuOid)}
          />
        }
      />
      <LabeledInfoItem label={t('yleinen.haun-tunniste')} value={haku.oid} />
    </>
  );
};

const HakukohdeInfo = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const { t, translateEntity } = useTranslations();
  const { data: hakukohde } = useHakukohde({ hakukohdeOid });

  return (
    <>
      <LabeledInfoItem
        label={t('yleinen.hakukohde')}
        value={
          <ExternalLink
            name={translateEntity(hakukohde.nimi)}
            href={buildLinkToHakukohde(hakukohdeOid)}
          />
        }
      />
      <LabeledInfoItem
        label={t('yleinen.hakukohteen-tunniste')}
        value={hakukohdeOid}
      />
    </>
  );
};

// Hakukohdetta ei näytetä, jos valintatapajonon hakukohdetta ei löytynyt
export const TarjontaInfo = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid?: string;
}) => {
  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={2}
      sx={{
        paddingTop: 1,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        maxWidth: '1920px',
      }}
    >
      <HakuInfo hakuOid={hakuOid} />
      {hakukohdeOid && <HakukohdeInfo hakukohdeOid={hakukohdeOid} />}
    </Stack>
  );
};
