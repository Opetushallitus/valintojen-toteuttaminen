'use client';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AccordionBox } from '@/app/components/accordion-box';
import { useJonosijatSearch } from '@/app/hooks/useJonosijatSearch';
import { LaskettuValintatapajonoTable } from './laskettu-valintatapajono-table';
import { ValintatapajonoAccordionTitle } from './valintatapajono-accordion-title';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import {
  LaskettuJonoWithHakijaInfo,
  LaskettuValinnanvaiheInfo,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { IlmanLaskentaaValintatapajonoTable } from './ilman-laskentaa-valintatapajono-table';
import { useState } from 'react';
import { ArvoTypeChangeConfirmationModal } from './arvo-type-change-confirmation-modal';
import { showModal } from '@/app/components/global-modal';
import { OphButton } from '@opetushallitus/oph-design-system';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { Haku } from '@/app/lib/types/kouta-types';

const LaskettuVaiheActions = ({
  hakukohdeOid,
  jono,
}: {
  hakukohdeOid: string;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { data: hakukohde } = useHakukohde({ hakukohdeOid });
  const { data: permissions } = useUserPermissions();
  const statusMutation = useSijoitteluStatusMutation(hakukohdeOid);

  return (
    <SijoitteluStatusChangeButton
      organisaatioOid={hakukohde?.organisaatioOid}
      jono={jono}
      permissions={permissions}
      statusMutation={statusMutation}
    />
  );
};

export type ArvoType = 'kokonaispisteet' | 'jonosija';

const LaskennatonVaiheActions = ({
  hakukohdeOid,
  jono,
  arvoType,
  setArvoType,
}: {
  hakukohdeOid: string;
  jono: LaskettuJonoWithHakijaInfo;
  arvoType: ArvoType;
  setArvoType: (newArvoType: ArvoType) => void;
}) => {
  const { data: hakukohde } = useHakukohde({ hakukohdeOid });
  const { data: permissions } = useUserPermissions();
  const statusMutation = useSijoitteluStatusMutation(hakukohdeOid);

  const { t } = useTranslations();

  const onArvoTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newArvoType: string,
  ) => {
    showModal(ArvoTypeChangeConfirmationModal, {
      text:
        newArvoType === 'jonosija'
          ? 'Jos siirryt käyttämään jonosijoja, kokonaispisteet poistetaan.'
          : 'Jos siirryt käyttämään kokonaispisteitä, jonosijat poistetaan.',
      onConfirm: () => {
        setArvoType(newArvoType as ArvoType);
        // TODO: tyhjennä jonosijat/kokonaispisteet
      },
    });
  };

  // TODO: Tallennus
  const isPending = false;

  return (
    <Stack
      direction="row"
      gap={2}
      sx={{ alignItems: 'flex-start', marginBottom: 1 }}
    >
      <OphButton
        variant="contained"
        type="submit"
        disabled={isPending}
        startIcon={isPending ? <SpinnerIcon /> : null}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      <SijoitteluStatusChangeButton
        organisaatioOid={hakukohde?.organisaatioOid}
        jono={jono}
        permissions={permissions}
        statusMutation={statusMutation}
      />
      <ToggleButtonGroup
        color="primary"
        value={arvoType}
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

  const { results, sort, setSort, pageSize, setPage, page } =
    useJonosijatSearch(valintatapajonooid, jonosijat);

  const { t } = useTranslations();
  return (
    <Box
      key={jono.oid}
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        id={valinnanVaihe.valinnanvaiheoid}
        title={
          <ValintatapajonoAccordionTitle
            valinnanVaihe={valinnanVaihe}
            jono={jono}
          />
        }
      >
        <LaskettuVaiheActions hakukohdeOid={hakukohdeOid} jono={jono} />
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
    useJonosijatSearch(valintatapajonooid, jonosijat);

  const [arvoType, setArvoType] = useState<ArvoType>(
    jono.kaytetaanKokonaispisteita ? 'kokonaispisteet' : 'jonosija',
  );

  return (
    <Box
      key={jono.oid}
      sx={{
        width: '100%',
      }}
    >
      <AccordionBox
        id={valinnanVaihe.valinnanvaiheoid}
        title={
          <ValintatapajonoAccordionTitle
            valinnanVaihe={valinnanVaihe}
            jono={jono}
          />
        }
      >
        <LaskennatonVaiheActions
          hakukohdeOid={hakukohdeOid}
          jono={jono}
          arvoType={arvoType}
          setArvoType={setArvoType}
        />
        <IlmanLaskentaaValintatapajonoTable
          haku={haku}
          setSort={setSort}
          sort={sort}
          valintatapajonoOid={valintatapajonooid}
          jonosijat={results}
          arvoType={arvoType}
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
