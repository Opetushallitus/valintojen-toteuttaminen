import { useUserPermissions } from '@/hooks/useUserPermissions';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { useJonoTuloksetSearch } from '@/hooks/useJonoTuloksetSearch';
import { useTranslations } from '@/lib/localization/useTranslations';
import { LaskettuValintatapajonoTable } from './laskettu-valintatapajono-table';
import { getValintatapaJonoNimi } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { ValintatapajonoContentProps } from '../types/valintatapajono-types';

const LaskettuVaiheActions = ({
  hakukohde,
  jono,
}: {
  hakukohde: Hakukohde;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
}) => {
  const permissions = useUserPermissions();
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
    <>
      <LaskettuVaiheActions hakukohde={hakukohde} jono={jono} />
      <LaskettuValintatapajonoTable
        hakukohde={hakukohde}
        setSort={setSort}
        sort={sort}
        jono={jono}
        rows={results}
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
