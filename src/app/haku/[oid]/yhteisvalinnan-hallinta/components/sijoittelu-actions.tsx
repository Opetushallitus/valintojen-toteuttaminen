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
import { FileDownloadButton } from '@/components/file-download-button';
import {
  getOsoitetarratHaulle,
  getSijoittelunTulosHaulleExcel,
  luoHyvaksymiskirjeetHaullePDF,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { getSijoittelunTuloksenPerustiedotHaulle } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { SijoitteluBasicInfo } from './sijoittelu-basic-info';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SijoitteluButton = ({
  hakuOid,
  sijoitteluRunning,
  infoRefetch,
}: {
  hakuOid: string;
  sijoitteluRunning: boolean;
  infoRefetch: () => void;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const [startingSijoittelu, setStartingSijoittelu] = useState(false);

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
        if (result.valmis) {
          infoRefetch();
        }
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
    setStartingSijoittelu(true);
    try {
      await kaynnistaSijoittelu(hakuOid);
      setStartingSijoittelu(false);
      setSijoitteluInProgress(true);
    } catch (e) {
      console.error(e);
      addToast({
        key: `sijoittelu-${hakuOid}}`,
        type: 'error',
        message: 'yhteisvalinnan-hallinta.sijoittelu.suoritus-epaonnistui',
        manualCloseOnly: true,
      });
      setStartingSijoittelu(false);
    }
  };

  return (
    <OphButton
      onClick={startSijoittelu}
      variant="contained"
      loading={sijoitteluInProgress || startingSijoittelu}
      disabled={sijoitteluInProgress || startingSijoittelu}
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

  const { data: basicInfo, refetch } = useQuery({
    queryKey: ['sijoittelu-basic-info', hakuOid],
    queryFn: async () => getSijoittelunTuloksenPerustiedotHaulle(hakuOid),
  });

  return (
    <Box>
      <SijoitteluBasicInfo basicInfo={basicInfo} />
      <ActionsContainer sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <SijoitteluButton
          hakuOid={hakuOid}
          sijoitteluRunning={sijoitteluRunning}
          infoRefetch={refetch}
        />
        <FileDownloadButton
          component={OphButton}
          variant="outlined"
          sx={{ flexWrap: 'wrap' }}
          getFile={() => getSijoittelunTulosHaulleExcel(hakuOid)}
          manualCloseOnlyError={true}
          errorKey="get-haku-tulokset-error"
          errorMessage="yhteisvalinnan-hallinta.sijoittelu.vie-tulokset-virhe"
          defaultFileName="haku-tulokset.xlsx"
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.vie-tulokset')}
        </FileDownloadButton>
        <FileDownloadButton
          component={OphButton}
          variant="outlined"
          getFile={() =>
            getOsoitetarratHaulle({
              hakuOid,
            })
          }
          manualCloseOnlyError={true}
          errorKey="get-haku-osoitetarrat-error"
          errorMessage="yhteisvalinnan-hallinta.sijoittelu.vie-tarrat-virhe"
          defaultFileName="haku-osoitetarrat.pdf"
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.vie-tarrat')}
        </FileDownloadButton>
        <FileDownloadButton
          component={OphButton}
          variant="outlined"
          getFile={() =>
            luoHyvaksymiskirjeetHaullePDF({
              hakuOid,
            })
          }
          manualCloseOnlyError={true}
          errorKey="get-haku-kirjeet-error"
          errorMessage="yhteisvalinnan-hallinta.sijoittelu.vie-kirjeiksi-virhe"
          defaultFileName="haku-hyvaksymiskirjeet.pdf"
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.vie-kirjeiksi')}
        </FileDownloadButton>
      </ActionsContainer>
    </Box>
  );
};
