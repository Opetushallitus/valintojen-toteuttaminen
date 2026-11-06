import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import { ButtonProps } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { TFunction, useTranslations } from '@/lib/localization/useTranslations';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';
import {
  checkHasHakukohdePermission,
  checkHasPermission,
  HakuPermissions,
} from '@/lib/permissions';
import { useHakuPermissions } from '@/hooks/useHakuPermissions';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { useHasOnlyHakukohdeReadPermission } from '@/hooks/useHasOnlyHakukohdeReadPermission';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { showModal } from '@/components/modals/global-modal';

const SijoitteluButton = ({ ...props }: ButtonProps) => {
  return <OphButton {...props} variant="outlined" />;
};

export const PureSijoitteluStatusChangeButton = ({
  hakukohde,
  jono,
  statusMutation,
  hakuPermissions,
  t,
}: {
  hakukohde: Pick<Hakukohde, 'oid' | 'hakuOid' | 'tarjoajaOid'>;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  statusMutation: ReturnType<typeof useSijoitteluStatusMutation>;
  hakuPermissions: HakuPermissions;
  t: TFunction;
}) => {
  const hasOphUpdate = checkHasPermission(
    OPH_ORGANIZATION_OID,
    hakuPermissions.userPermissions,
    'READ_UPDATE',
  );

  const hasOrgCrud = checkHasHakukohdePermission(
    hakukohde,
    hakuPermissions,
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
  hakukohde,
  jono,
  statusMutation,
}: {
  hakukohde: Hakukohde;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
  statusMutation: ReturnType<typeof useSijoitteluStatusMutation>;
}) => {
  const { t } = useTranslations();
  const hakuPermissions = useHakuPermissions(hakukohde.hakuOid);
  const userHasOnlyReadPermission = useHasOnlyHakukohdeReadPermission();

  return userHasOnlyReadPermission ? null : (
    <PureSijoitteluStatusChangeButton
      hakukohde={hakukohde}
      jono={jono}
      statusMutation={statusMutation}
      hakuPermissions={hakuPermissions}
      t={t}
    />
  );
};
