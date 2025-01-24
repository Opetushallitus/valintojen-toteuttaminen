'use client';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AccordionBox } from '@/app/components/accordion-box';
import { useJonoTuloksetSearch } from '@/app/hooks/useJonoTuloksetSearch';
import { LaskettuValintatapajonoTable } from './laskettu-valintatapajono-table';
import { ValintatapajonoAccordionTitle } from './valintatapajono-accordion-title';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import {
  hakukohteenLasketutValinnanvaiheetQueryOptions,
  LaskettuJonoWithHakijaInfo,
  LaskettuValinnanvaiheInfo,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { IlmanLaskentaaValintatapajonoTable } from './ilman-laskentaa-valintatapajono-table';
import { useCallback } from 'react';
import { ArvoTypeChangeConfirmationModal } from './arvo-type-change-confirmation-modal';
import { hideModal, showModal } from '@/app/components/global-modal';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import {
  JarjestysPeruste,
  JonoTulosActorRef,
  useJonoTulosActorRef,
  useJonotulosState,
  useSelectedJarjestysperuste,
} from '@/app/lib/state/jono-tulos-state';
import useToaster from '@/app/hooks/useToaster';
import { GenericEvent, OphApiError } from '@/app/lib/common';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { FileDownloadButton } from '@/app/components/file-download-button';
import {
  getValintatapajonoTulosExcel,
  saveValintatapajonoTulosExcel,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { FileSelectButton } from '@/app/components/file-select-button';
import { SpinnerModal } from '@/app/components/spinner-modal';

const LaskettuVaiheActions = ({
  hakukohde,
  jono,
}: {
  hakukohde: Hakukohde;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { data: permissions } = useUserPermissions();
  const statusMutation = useSijoitteluStatusMutation(hakukohde.oid);

  return (
    <SijoitteluStatusChangeButton
      organisaatioOid={hakukohde?.organisaatioOid}
      jono={jono}
      permissions={permissions}
      statusMutation={statusMutation}
    />
  );
};
const refetchLaskennanTulokset = ({
  queryClient,
  hakukohdeOid,
}: {
  queryClient: QueryClient;
  hakukohdeOid: string;
}) => {
  const options = hakukohteenLasketutValinnanvaiheetQueryOptions(hakukohdeOid);
  queryClient.resetQueries(options);
  queryClient.invalidateQueries(options);
};

const useJonoExcelUploadMutation = ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajonoOid: string;
}) => {
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      showModal(SpinnerModal, {
        title: t(
          'valintalaskennan-tulokset.tuodaan-tuloksia-taulukkolaskennasta',
        ),
      });
      return await saveValintatapajonoTulosExcel({
        hakuOid,
        hakukohdeOid,
        valintatapajonoOid,
        file,
      });
    },
    onError: (error) => {
      hideModal(SpinnerModal);
      // Tuonti onnistui osittain -> ladataan muuttuneet tulokset
      if (error instanceof OphApiError) {
        refetchLaskennanTulokset({ queryClient, hakukohdeOid });
      }
      addToast({
        key: 'upload-valintatapajono-excel-error',
        message: 'valintalaskennan-tulokset.virhe-tuo-taulukkolaskennasta',
        type: 'error',
      });
    },
    onSuccess: () => {
      hideModal(SpinnerModal);
      // Ladataan muuttuneet pistetulokset
      refetchLaskennanTulokset({ queryClient, hakukohdeOid });
      addToast({
        key: 'upload-valintatapajono-excel-success',
        message: 'valintalaskennan-tulokset.tuo-taulukkolaskennasta-onnistui',
        type: 'success',
      });
    },
  });
};

const JonoExcelUploadButton = ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajonoOid: string;
}) => {
  const { t } = useTranslations();
  const { mutate } = useJonoExcelUploadMutation({
    hakuOid,
    hakukohdeOid,
    valintatapajonoOid,
  });
  return (
    <FileSelectButton
      onFileSelect={(file) => {
        mutate({ file });
      }}
    >
      {t('yleinen.tuo-taulukkolaskennasta')}
    </FileSelectButton>
  );
};

const LaskennatonVaiheActions = ({
  hakukohde,
  jono,
  jonoTulosActorRef,
}: {
  hakukohde: Hakukohde;
  jono: LaskettuJonoWithHakijaInfo;
  jonoTulosActorRef: JonoTulosActorRef;
}) => {
  const { data: permissions } = useUserPermissions();
  const statusMutation = useSijoitteluStatusMutation(hakukohde.oid);

  const { saveJonoTulos, isUpdating } = useJonoTulosActorRef(jonoTulosActorRef);

  const [jarjestysPeruste, setJarjestysPeruste] =
    useSelectedJarjestysperuste(jonoTulosActorRef);

  const { t } = useTranslations();

  const onArvoTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newJarjestysPeruste: string | null,
  ) => {
    if (newJarjestysPeruste) {
      showModal(ArvoTypeChangeConfirmationModal, {
        text:
          newJarjestysPeruste === 'jonosija'
            ? t('valintalaskennan-tulokset.jonosija-valinta-varoitus')
            : t('valintalaskennan-tulokset.kokonaispisteet-valinta-varoitus'),
        onConfirm: () => {
          setJarjestysPeruste(newJarjestysPeruste as JarjestysPeruste);
        },
      });
    }
  };

  return (
    <Stack
      direction="row"
      gap={2}
      sx={{ alignItems: 'flex-start', marginBottom: 1, flexWrap: 'wrap' }}
    >
      <OphButton
        variant="contained"
        type="submit"
        onClick={() => saveJonoTulos()}
        loading={isUpdating}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      <SijoitteluStatusChangeButton
        organisaatioOid={hakukohde?.organisaatioOid}
        jono={jono}
        permissions={permissions}
        statusMutation={statusMutation}
      />
      <FileDownloadButton
        defaultFileName="valintalaskennan-tulokset.xlsx"
        getFile={() =>
          getValintatapajonoTulosExcel({
            hakuOid: hakukohde.hakuOid,
            hakukohdeOid: hakukohde.oid,
            valintatapajonoOid: jono.valintatapajonooid,
          })
        }
        errorKey="get-valintatapajono-tulos-excel-error"
        errorMessage="valintalaskennan-tulokset.virhe-vie-taulukkolaskentaan"
      >
        {t('yleinen.vie-taulukkolaskentaan')}
      </FileDownloadButton>
      <JonoExcelUploadButton
        hakuOid={hakukohde.hakuOid}
        hakukohdeOid={hakukohde.oid}
        valintatapajonoOid={jono.oid}
      />
      <ToggleButtonGroup
        color="primary"
        value={jarjestysPeruste}
        onChange={onArvoTypeChange}
        exclusive
      >
        <ToggleButton value="jonosija">
          {t('valintalaskennan-tulokset.jonosija')}
        </ToggleButton>
        <ToggleButton value="kokonaispisteet">
          {t('valintalaskennan-tulokset.kokonaispisteet')}
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
};

export type LaskettuValintatapajonoContentProps = {
  haku: Haku;
  hakukohdeOid: string;
  valinnanVaihe: LaskettuValinnanvaiheInfo;
  jono: LaskettuJonoWithHakijaInfo;
};

export const LaskettuValintatapajonoContent = ({
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: LaskettuValintatapajonoContentProps) => {
  const { valintatapajonooid, jonosijat } = jono;

  const { data: hakukohde } = useHakukohde({ hakukohdeOid });

  const { results, sort, setSort, pageSize, setPage, page } =
    useJonoTuloksetSearch(valintatapajonooid, jonosijat);

  const { t } = useTranslations();
  return (
    <Box
      key={jono.oid}
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        headingComponent="h4"
        id={valinnanVaihe.valinnanvaiheoid}
        title={
          <ValintatapajonoAccordionTitle
            valinnanVaihe={valinnanVaihe}
            jono={jono}
          />
        }
      >
        <LaskettuVaiheActions hakukohde={hakukohde} jono={jono} />
        <LaskettuValintatapajonoTable
          setSort={setSort}
          sort={sort}
          jonoId={valintatapajonooid}
          jonosijat={results}
          pagination={{
            page,
            setPage,
            pageSize,
            label:
              t('yleinen.sivutus') +
              ': ' +
              getValintatapaJonoNimi({
                valinnanVaiheNimi: valinnanVaihe.nimi,
                jonoNimi: jono.nimi,
              }),
          }}
        />
      </AccordionBox>
    </Box>
  );
};

export const ValintatapajonoIlmanLaskentaaContent = ({
  haku,
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: LaskettuValintatapajonoContentProps) => {
  const { t } = useTranslations();

  const { valintatapajonooid, jonosijat } = jono;

  const { results, sort, setSort, pageSize, setPage, page } =
    useJonoTuloksetSearch(valintatapajonooid, jonosijat);

  const { addToast } = useToaster();

  const { data: hakukohde } = useHakukohde({ hakukohdeOid });

  const queryClient = useQueryClient();

  const onEvent = useCallback(
    (event: GenericEvent) => {
      if (event.type === 'success') {
        refetchLaskennanTulokset({
          queryClient,
          hakukohdeOid,
        });
      }
      addToast(event);
    },
    [addToast, queryClient, hakukohdeOid],
  );

  const { actorRef: jonoTulosActorRef } = useJonotulosState({
    valinnanvaihe: valinnanVaihe,
    hakukohde,
    laskettuJono: jono,
    onEvent,
  });

  return (
    <Box
      key={jono.oid}
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        headingComponent="h4"
        id={valinnanVaihe.valinnanvaiheoid}
        title={
          <ValintatapajonoAccordionTitle
            valinnanVaihe={valinnanVaihe}
            jono={jono}
          />
        }
      >
        <LaskennatonVaiheActions
          jonoTulosActorRef={jonoTulosActorRef}
          hakukohde={hakukohde}
          jono={jono}
        />
        <IlmanLaskentaaValintatapajonoTable
          haku={haku}
          setSort={setSort}
          sort={sort}
          valintatapajonoOid={valintatapajonooid}
          jonosijat={results}
          jonoTulosActorRef={jonoTulosActorRef}
          pagination={{
            page,
            setPage,
            pageSize,
            label:
              t('yleinen.sivutus') +
              ': ' +
              getValintatapaJonoNimi({
                valinnanVaiheNimi: valinnanVaihe.nimi,
                jonoNimi: jono.nimi,
              }),
          }}
        />
      </AccordionBox>
    </Box>
  );
};
