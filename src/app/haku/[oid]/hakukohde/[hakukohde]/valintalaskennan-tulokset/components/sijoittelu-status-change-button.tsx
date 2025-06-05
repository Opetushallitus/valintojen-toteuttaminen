import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import { ButtonProps } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { TFunction, useTranslations } from '@/lib/localization/useTranslations';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import { checkHasPermission, UserPermissions } from '@/lib/permissions';
import {
  useHierarchyUserPermissions,
  useUserPermissions,
} from '@/hooks/useUserPermissions';

const SijoitteluButton = ({ ...props }: ButtonProps) => {
  return <OphButton {...props} variant="outlined" />;
};

export const PureSijoitteluStatusChangeButton = ({
  tarjoajaOid,
  jono,
  statusMutation,
  userPermissions,
  t,
}: {
  tarjoajaOid: string;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  statusMutation: ReturnType<typeof useSijoitteluStatusMutation>;
  userPermissions: UserPermissions;
  t: TFunction;
}) => {
  const hasOphUpdate = checkHasPermission(
    OPH_ORGANIZATION_OID,
    userPermissions,
    'READ_UPDATE',
  );

  const hasOrgCrud = checkHasPermission(tarjoajaOid, userPermissions, 'CRUD');

  switch (true) {
    case !jono.valmisSijoiteltavaksi && jono.siirretaanSijoitteluun:
      return (
        <SijoitteluButton
          sx={{ marginBottom: 2 }}
          loading={statusMutation.isPending}
          disabled={!hasOphUpdate && !hasOrgCrud}
          onClick={() =>
            statusMutation.mutate({ jono, jonoSijoitellaan: true })
          }
        >
          {t('valintalaskennan-tulokset.siirra-jono-sijoitteluun')}
        </SijoitteluButton>
      );
    case jono.valmisSijoiteltavaksi && jono.siirretaanSijoitteluun:
      return (
        <SijoitteluButton
          loading={statusMutation.isPending}
          disabled={!hasOphUpdate}
          onClick={() =>
            statusMutation.mutate({ jono, jonoSijoitellaan: false })
          }
        >
          {t('valintalaskennan-tulokset.poista-jono-sijoittelusta')}
        </SijoitteluButton>
      );
    default:
      return null;
  }
};

export const SijoitteluStatusChangeButton = ({
  tarjoajaOid,
  jono,
  statusMutation,
}: {
  tarjoajaOid: string;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  statusMutation: ReturnType<typeof useSijoitteluStatusMutation>;
}) => {
  const { t } = useTranslations();
  const userPermissions = useUserPermissions();
  const hierarchyUserPermissions = useHierarchyUserPermissions(userPermissions);

  return (
    <PureSijoitteluStatusChangeButton
      tarjoajaOid={tarjoajaOid}
      jono={jono}
      statusMutation={statusMutation}
      userPermissions={hierarchyUserPermissions}
      t={t}
    />
  );
};
