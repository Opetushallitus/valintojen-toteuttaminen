import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import { UserPermissions } from '@/lib/permissions';
import { ButtonProps } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { useTranslations } from '@/lib/localization/useTranslations';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';

const SijoitteluButton = ({ ...props }: ButtonProps) => {
  return <OphButton {...props} variant="outlined" />;
};

export const SijoitteluStatusChangeButton = ({
  organisaatioOid,
  jono,
  permissions,
  statusMutation,
}: {
  organisaatioOid: string;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  permissions: UserPermissions;
  statusMutation: ReturnType<typeof useSijoitteluStatusMutation>;
}) => {
  const { t } = useTranslations();

  const hasOphUpdate =
    permissions.writeOrganizations.includes(OPH_ORGANIZATION_OID);

  const hasOrgCrud = permissions.crudOrganizations.includes(organisaatioOid);

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
