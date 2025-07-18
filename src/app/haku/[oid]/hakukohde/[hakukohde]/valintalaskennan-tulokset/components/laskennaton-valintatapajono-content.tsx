'use client';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useJonoTuloksetSearch } from '@/hooks/useJonoTuloksetSearch';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import { useTranslations } from '@/lib/localization/useTranslations';
import { getValintatapaJonoNimi } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { LaskennatonValintatapajonoTable } from './laskennaton-valintatapajono-table';
import { useCallback } from 'react';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { showModal } from '@/components/modals/global-modal';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import {
  JarjestysPeruste,
  JonoTulosActorRef,
  useIsJonoTulosDirty,
  useJonoTulosActorRef,
  useJonotulosState,
  useSelectedJarjestysperuste,
} from '@/lib/state/jono-tulos-state';
import useToaster from '@/hooks/useToaster';
import { GenericEvent } from '@/lib/common';
import { useQueryClient } from '@tanstack/react-query';
import { FileDownloadButton } from '@/components/file-download-button';
import { getValintatapajonoTulosExcel } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { ValintatapajonoContentProps } from '../types/valintatapajono-types';
import { LaskennatonJonoExcelUploadButton } from './laskennaton-jono-excel-upload-button';
import { refetchHakukohteenValintalaskennanTulokset } from '@/lib/valintalaskenta/valintalaskenta-queries';

const LaskennatonVaiheActions = ({
  hakukohde,
  jono,
  jonoTulosActorRef,
}: {
  hakukohde: Hakukohde;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  jonoTulosActorRef: JonoTulosActorRef;
}) => {
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
      showModal(ConfirmationGlobalModal, {
        title: t('valintalaskennan-tulokset.vaihdetaanko-jarjestysperustetta'),
        content:
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
        tarjoajaOid={hakukohde?.tarjoajaOid}
        jono={jono}
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
      <LaskennatonJonoExcelUploadButton
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

export const LaskennatonValintatapajonoContent = ({
  haku,
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: ValintatapajonoContentProps) => {
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
        refetchHakukohteenValintalaskennanTulokset({
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

  const isDirty = useIsJonoTulosDirty(jonoTulosActorRef);
  useConfirmChangesBeforeNavigation(isDirty);

  return (
    <>
      <LaskennatonVaiheActions
        jonoTulosActorRef={jonoTulosActorRef}
        hakukohde={hakukohde}
        jono={jono}
      />
      <LaskennatonValintatapajonoTable
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
    </>
  );
};
