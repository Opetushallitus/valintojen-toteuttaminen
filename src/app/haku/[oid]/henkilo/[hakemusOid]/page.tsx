'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication } from '@/app/lib/ataru';
import { LinearProgress, Stack, styled, Typography } from '@mui/material';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { HakutoiveetTable } from './components/hakutoiveet-table';
import { useHenkiloPageData } from './hooks/useHenkiloPageData';
import { use, useState } from 'react';
import { HenkilonPistesyotto } from './components/henkilon-pistesyotto';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '@/app/lib/mui-utils';

const PROGRESSBAR_HEIGHT = '42px';

const ProgressBar = ({ value }: { value: number }) => {
  return (
    <LinearProgress
      value={value}
      variant="determinate"
      sx={{
        display: 'block',
        height: PROGRESSBAR_HEIGHT,
        maxWidth: '700px',
        borderRadius: '2px',
        border: `1px solid ${ophColors.grey300}`,
        backgroundColor: ophColors.white,
        '& .MuiLinearProgress-barColorPrimary': {
          backgroundColor: ophColors.cyan1,
        },
      }}
    />
  );
};

const LaskentaButton = withDefaultProps(
  styled(OphButton)({
    alignSelf: 'flex-start',
  }),
  {
    variant: 'contained',
  },
);

const Valintalaskenta = () => {
  const { t } = useTranslations();

  const [laskentaKaynnissa, setLaskentaKaynnissa] = useState(false);

  return (
    <Stack spacing={2}>
      {laskentaKaynnissa ? (
        <>
          <OphTypography variant="h4">
            {t('henkilo.valintalaskenta')}
          </OphTypography>
          <ProgressBar value={10} />
          <LaskentaButton
            onClick={() => {
              setLaskentaKaynnissa(false);
            }}
          >
            {t('henkilo.keskeyta-valintalaskenta')}
          </LaskentaButton>
        </>
      ) : (
        <>
          <LaskentaButton
            onClick={() => {
              setLaskentaKaynnissa(true);
            }}
          >
            {t('henkilo.suorita-valintalaskenta')}
          </LaskentaButton>
        </>
      )}
    </Stack>
  );
};

const HenkiloContent = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { t, translateEntity } = useTranslations();

  const { hakukohteet, hakija, postitoimipaikka } = useHenkiloPageData({
    hakuOid,
    hakemusOid,
  });

  return (
    <>
      <Typography variant="h2">{getHenkiloTitle(hakija)}</Typography>
      <Valintalaskenta />
      <Stack direction="row" spacing="4vw">
        <LabeledInfoItem
          label={t('henkilo.hakemus-oid')}
          value={
            <ExternalLink
              name={hakija.hakemusOid}
              href={buildLinkToApplication(hakija.hakemusOid)}
              noIcon={true}
            />
          }
        />
        <LabeledInfoItem
          label={t('henkilo.lahiosoite')}
          value={`${hakija.lahiosoite}, ${hakija.postinumero} ${translateEntity(postitoimipaikka)}`}
        />
      </Stack>
      <HakutoiveetTable hakukohteet={hakukohteet} hakija={hakija} />
      <HenkilonPistesyotto hakija={hakija} hakukohteet={hakukohteet} />
    </>
  );
};

export default function HenkiloPage(props: {
  params: Promise<{ oid: string; hakemusOid: string }>;
}) {
  const params = use(props.params);
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  return (
    <Stack spacing={2} sx={{ margin: 4, width: '100%', overflowX: 'hidden' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
