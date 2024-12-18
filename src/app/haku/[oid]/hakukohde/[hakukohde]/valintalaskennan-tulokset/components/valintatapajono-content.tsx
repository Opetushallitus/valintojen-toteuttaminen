'use client';
import { Box } from '@mui/material';
import { LaskettuValinnanVaiheModel } from '@/app/lib/types/laskenta-types';
import { AccordionBox } from '@/app/components/accordion-box';
import { useJonosijatSearch } from '@/app/hooks/useJonosijatSearch';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { LaskettuValintatapajonoTable } from './laskettu-valintatapajono-table';
import { ValintatapajonoAccordionTitle } from './valintatapajono-accordion-title';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import {
  JonoSijaWithHakijaInfo,
  LaskettuJonoWithHakijaInfo,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getValintatapaJonoNimi } from '@/app/lib/valintalaskenta-utils';

const PaginatedValintatapajonoTable = ({
  label,
  jonoId,
  jonosijat,
}: {
  label: string;
  jonoId: string;
  jonosijat: Array<JonoSijaWithHakijaInfo>;
}) => {
  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useJonosijatSearch(jonoId, jonosijat);

  return (
    <TablePaginationWrapper
      label={label}
      totalCount={results?.length ?? 0}
      pageSize={pageSize}
      setPageNumber={setPage}
      pageNumber={page}
      countHidden={true}
    >
      <LaskettuValintatapajonoTable
        setSort={setSort}
        sort={sort}
        jonoId={jonoId}
        jonosijat={pageResults}
      />
    </TablePaginationWrapper>
  );
};

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

export const ValintatapajonoContent = ({
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: {
  hakukohdeOid: string;
  valinnanVaihe: Omit<LaskettuValinnanVaiheModel, 'valintatapajonot'>;
  jono: LaskettuJonoWithHakijaInfo;
}) => {
  const { t } = useTranslations();
  const label =
    t('yleinen.sivutus') +
    ': ' +
    getValintatapaJonoNimi({
      valinnanVaiheNimi: valinnanVaihe.nimi,
      jonoNimi: jono.nimi,
    });
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
        <PaginatedValintatapajonoTable
          label={label}
          jonoId={jono.valintatapajonooid}
          jonosijat={jono.jonosijat}
        />
      </AccordionBox>
    </Box>
  );
};
