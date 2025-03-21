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
import { SpinnerIcon } from '@/components/spinner-icon';

const ProgressSijoittelu = ({
  hakuOid,
  sijoitteluInProgress,
  setSijoitteluInProgress,
}: {
  hakuOid: string;
  sijoitteluInProgress: boolean;
  setSijoitteluInProgress: (value: boolean) => void;
}) => {
  useQuery({
    queryKey: ['sijoitteluStatus', hakuOid],
    queryFn: async () => {
      const result = await sijoittelunStatus(hakuOid);
      if (result.valmis || result.ohitettu) {
        setSijoitteluInProgress(false);
      }
      return result;
    },
    refetchInterval: 5000,
    enabled: sijoitteluInProgress,
  });

  return <SpinnerIcon />;
};

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const SijoitteluActions = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();
  const [sijoitteluInProgress, setSijoitteluInProgress] =
    useState<boolean>(false);

  const startSijoittelu = async () => {
    setSijoitteluInProgress(true);
    await kaynnistaSijoittelu(hakuOid);
  };

  return (
    <Box>
      {sijoitteluInProgress && (
        <ProgressSijoittelu
          hakuOid={hakuOid}
          sijoitteluInProgress={sijoitteluInProgress}
          setSijoitteluInProgress={setSijoitteluInProgress}
        />
      )}
      <ActionsContainer>
        <OphButton
          onClick={startSijoittelu}
          variant="contained"
          loading={false}
          disabled={sijoitteluInProgress}
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.suorita')}
        </OphButton>
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
