'use client';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AccordionBox } from '@/app/components/accordion-box';
import { useJonoTuloksetSearch } from '@/app/hooks/useJonoTuloksetSearch';
import { ValintatapajonoAccordionTitle } from './valintatapajono-accordion-title';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/app/hooks/useEditableValintalaskennanTulokset';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { LaskennatonValintatapajonoTable } from './laskennaton-valintatapajono-table';
import { useCallback } from 'react';
import { GlobalConfirmationModal } from '@/app/components/global-confirmation-modal';
import { showModal } from '@/app/components/global-modal';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import {
  JarjestysPeruste,
  JonoTulosActorRef,
  useIsJonoTulosDirty,
  useJonoTulosActorRef,
  useJonotulosState,
  useSelectedJarjestysperuste,
} from '@/app/lib/state/jono-tulos-state';
import useToaster from '@/app/hooks/useToaster';
import { GenericEvent } from '@/app/lib/common';
import { useQueryClient } from '@tanstack/react-query';
import { FileDownloadButton } from '@/app/components/file-download-button';
import { getValintatapajonoTulosExcel } from '@/app/lib/valintalaskentakoostepalvelu';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { ValintatapajonoContentProps } from '../types/valintatapajono-types';
import { LaskennatonJonoExcelUploadButton } from './laskennaton-jono-excel-upload-button';
import { refetchLaskennanTulokset } from '../lib/refetchLaskennanTulokset';

const LaskennatonVaiheActions = ({
  hakukohde,
  jono,
  jonoTulosActorRef,
}: {
  hakukohde: Hakukohde;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
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
      showModal(GlobalConfirmationModal, {
        title: t('valintalaskennan-tulokset.vaihdetaanko-jarjestysperustetta'),
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

  const isDirty = useIsJonoTulosDirty(jonoTulosActorRef);
  useConfirmChangesBeforeNavigation(isDirty);

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
      </AccordionBox>
    </Box>
  );
};
