'use client';
import { Box } from '@mui/material';
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
  LaskettuValinnanvaihe,
  LaskettuValinnanvaiheInfo,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { IlmanLaskentaaValintatapajonoTable } from './ilman-laskentaa-valintatapajono-table';

const JonoActions = ({
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

export type LaskettuValintatapajonoContentProps = {
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
        <JonoActions hakukohdeOid={hakukohdeOid} jono={jono} />
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
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: {
  hakukohdeOid: string;
  valinnanVaihe: LaskettuValinnanvaihe;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { t } = useTranslations();

  const { valintatapajonooid, jonosijat } = jono;

  const { results, sort, setSort, pageSize, setPage, page } =
    useJonosijatSearch(valintatapajonooid, jonosijat);

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
        <JonoActions hakukohdeOid={hakukohdeOid} jono={jono} />
        <IlmanLaskentaaValintatapajonoTable
          setSort={setSort}
          sort={sort}
          valintatapajonoOid={valintatapajonooid}
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
