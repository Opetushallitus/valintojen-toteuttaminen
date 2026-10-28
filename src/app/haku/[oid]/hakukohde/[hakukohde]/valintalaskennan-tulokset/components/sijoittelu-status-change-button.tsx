import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import { ButtonProps } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { TFunction, useTranslations } from '@/lib/localization/useTranslations';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import {
  checkHasHakukohdePermission,
  checkHasPermission,
  UserPermissions,
} from '@/lib/permissions';
import { useHakukohdePermissions } from '@/hooks/useHakukohdePermissions';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { useHasOnlyHakukohdeReadPermission } from '@/hooks/useHasOnlyHakukohdeReadPermission';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { showModal } from '@/components/modals/global-modal';

const SijoitteluButton = ({ ...props }: ButtonProps) => {
  return <OphButton {...props} variant="outlined" />;
};

export const PureSijoitteluStatusChangeButton = ({
  tarjoajaOid,
  hakukohderyhmaOids,
  jono,
  statusMutation,
  userPermissions,
  t,
}: {
  tarjoajaOid: string;
  hakukohderyhmaOids?: Array<string>;
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

  const hasOrgCrud = checkHasHakukohdePermission(
    { tarjoajaOid, hakukohderyhmaOids },
    userPermissions,
    'CRUD',
  );

  const { hasTulos, siirretaanSijoitteluun, valmisSijoiteltavaksi } = jono;

  // Sijoittelu-tiedon muokkaaminen ennen tuloksen tallentamista aiheuttaisi virheen
  if (!hasTulos) {
    return null;
  }

  switch (true) {
    case !valmisSijoiteltavaksi && siirretaanSijoitteluun:
      return (
        <SijoitteluButton
          sx={{ marginBottom: 2 }}
          loading={statusMutation.isPending}
          disabled={!hasOphUpdate && !hasOrgCrud}
          onClick={() =>
            showModal(ConfirmationGlobalModal, {
              title: t(
                'valintalaskennan-tulokset.siirra-jono-sijoitteluun-vahvistus-otsikko',
              ),
              content: t(
                'valintalaskennan-tulokset.siirra-jono-sijoitteluun-vahvistus-teksti',
                { jonoNimi: jono.nimi },
              ),
              onConfirm: () =>
                statusMutation.mutate({ jono, jonoSijoitellaan: true }),
            })
          }
        >
          {t('valintalaskennan-tulokset.siirra-jono-sijoitteluun')}
        </SijoitteluButton>
      );
    case valmisSijoiteltavaksi && siirretaanSijoitteluun:
      return (
        <SijoitteluButton
          sx={{ marginBottom: 2 }}
          loading={statusMutation.isPending}
          disabled={!hasOphUpdate}
          onClick={() =>
            showModal(ConfirmationGlobalModal, {
              title: t(
                'valintalaskennan-tulokset.poista-jono-sijoittelusta-vahvistus-otsikko',
              ),
              content: t(
                'valintalaskennan-tulokset.poista-jono-sijoittelusta-vahvistus-teksti',
                { jonoNimi: jono.nimi },
              ),
              onConfirm: () =>
                statusMutation.mutate({ jono, jonoSijoitellaan: false }),
            })
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
  hakukohde: rawHakukohde,
  jono,
  statusMutation,
}: {
  hakukohde: Hakukohde;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  statusMutation: ReturnType<typeof useSijoitteluStatusMutation>;
}) => {
  const { t } = useTranslations();
  const { hakukohde, hierarchyPermissions } =
    useHakukohdePermissions(rawHakukohde);
  const userHasOnlyReadPermission = useHasOnlyHakukohdeReadPermission();

  return userHasOnlyReadPermission ? null : (
    <PureSijoitteluStatusChangeButton
      tarjoajaOid={hakukohde.tarjoajaOid}
      hakukohderyhmaOids={hakukohde.hakukohderyhmaOids}
      jono={jono}
      statusMutation={statusMutation}
      userPermissions={hierarchyPermissions}
      t={t}
    />
  );
};
