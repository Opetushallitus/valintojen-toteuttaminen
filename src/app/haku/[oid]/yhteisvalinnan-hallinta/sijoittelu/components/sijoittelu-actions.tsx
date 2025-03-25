import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import {
  kaynnistaSijoittelu,
  sijoittelunStatus,
} from '@/lib/sijoittelu/sijoittelu-service';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useToaster from '@/hooks/useToaster';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SijoitteluButton = ({
  hakuOid,
  sijoitteluRunning,
}: {
  hakuOid: string;
  sijoitteluRunning: boolean;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const [sijoitteluInProgress, setSijoitteluInProgress] =
    useState<boolean>(sijoitteluRunning);

  useQuery({
    queryKey: ['sijoitteluStatusPolling', hakuOid],
    queryFn: async () => {
      const result = await sijoittelunStatus(hakuOid);
      if (result.valmis || result.ohitettu) {
        const toastKey = `sijoittelu-${hakuOid}}`;
        const message = result.valmis
          ? 'yhteisvalinnan-hallinta.sijoittelu.suoritus-onnistui'
          : 'yhteisvalinnan-hallinta.sijoittelu.suoritus-epaonnistui';
        addToast({
          key: toastKey,
          type: result.valmis ? 'success' : 'error',
          message,
          manualCloseOnly: true,
        });
        setSijoitteluInProgress(false);
      }
      if (!result) {
        setSijoitteluInProgress(false);
      }
      return result;
    },
    refetchInterval: 5000,
    enabled: sijoitteluInProgress,
  });

  const startSijoittelu = async () => {
    setSijoitteluInProgress(true);
    await kaynnistaSijoittelu(hakuOid);
  };

  return (
    <OphButton
      onClick={startSijoittelu}
      variant="contained"
      loading={sijoitteluInProgress}
      disabled={sijoitteluInProgress}
    >
      {t('yhteisvalinnan-hallinta.sijoittelu.suorita')}
    </OphButton>
  );
};

export const SijoitteluActions = ({
  hakuOid,
  sijoitteluRunning,
}: {
  hakuOid: string;
  sijoitteluRunning: boolean;
}) => {
  const { t } = useTranslations();

  return (
    <Box>
      <ActionsContainer>
        <SijoitteluButton
          hakuOid={hakuOid}
          sijoitteluRunning={sijoitteluRunning}
        />
        <OphButton
          onClick={() => {}}
          variant="outlined"
          loading={false}
          disabled={false}
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.vie-tulokset')}
        </OphButton>
        <OphButton
          onClick={() => {}}
          variant="outlined"
          loading={false}
          disabled={false}
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.vie-tarrat')}
        </OphButton>
        <OphButton
          onClick={() => {}}
          variant="outlined"
          loading={false}
          disabled={false}
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.vie-kirjeiksi')}
        </OphButton>
      </ActionsContainer>
    </Box>
  );
};
