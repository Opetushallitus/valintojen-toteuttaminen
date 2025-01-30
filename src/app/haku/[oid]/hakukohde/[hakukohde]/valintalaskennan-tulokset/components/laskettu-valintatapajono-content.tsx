import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { ValintatapajonoAccordionTitle } from './valintatapajono-accordion-title';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { LaskettuJonoWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useJonoTuloksetSearch } from '@/app/hooks/useJonoTuloksetSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { AccordionBox } from '@/app/components/accordion-box';
import { Box } from '@mui/material';
import { LaskettuValintatapajonoTable } from './laskettu-valintatapajono-table';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';
import { ValintatapajonoContentProps } from '../types/valintatapajono-types';

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

export const LaskettuValintatapajonoContent = ({
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: ValintatapajonoContentProps) => {
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
