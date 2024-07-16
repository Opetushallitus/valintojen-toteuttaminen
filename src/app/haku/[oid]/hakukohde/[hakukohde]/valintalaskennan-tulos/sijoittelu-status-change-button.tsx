import { OPH_ORGANIZATION_OID } from '@/app/lib/constants';
import { UserPermissions } from '@/app/lib/permissions';
import { ButtonProps } from '@mui/material';
import { Button } from '@opetushallitus/oph-design-system';
import { ClientSpinner } from '@/app/components/client-spinner';
import { useSijoitteluStatusMutation } from './useSijoitteluStatusMutation';
import { useTranslations } from '@/app/hooks/useTranslations';
import { LaskettuJonoWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';

export const SijoitteluButton = ({
  isLoading,
  disabled,
  startIcon,
  ...props
}: ButtonProps & { isLoading: boolean }) => {
  return (
    <Button
      {...props}
      disabled={isLoading || disabled}
      variant="outlined"
      startIcon={
        isLoading ? <ClientSpinner color="inherit" size="24px" /> : startIcon
      }
    />
  );
};

export const SijoitteluStatusChangeButton = ({
  organisaatioOid,
  jono,
  permissions,
  statusMutation,
}: {
  organisaatioOid: string;
  jono: LaskettuJonoWithHakijaInfo;
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
          isLoading={statusMutation.isPending}
          disabled={!hasOphUpdate && !hasOrgCrud}
          onClick={() => statusMutation.mutate({ jono, status: true })}
        >
          {t('valintalaskennan-tulos.siirra-jono-sijoitteluun')}
        </SijoitteluButton>
      );
    case jono.valmisSijoiteltavaksi && jono.siirretaanSijoitteluun:
      return (
        <SijoitteluButton
          isLoading={statusMutation.isPending}
          disabled={!hasOphUpdate}
          onClick={() => statusMutation.mutate({ jono, status: false })}
        >
          {t('valintalaskennan-tulos.poista-jono-sijoittelusta')}
        </SijoitteluButton>
      );
    default:
      return null;
  }
};
