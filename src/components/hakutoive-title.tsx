import { useTranslations } from '@/lib/localization/useTranslations';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { HakukohdeTabLink } from '@/components/hakukohde-tab-link';
import { Link } from '@mui/material';
import { NDASH } from '@/lib/constants';
import { useCheckPermission } from '@/hooks/useUserPermissions';

export const HakutoiveTitle = ({
  hakutoiveNumero,
  hakukohde,
}: {
  hakutoiveNumero: number;
  hakukohde: Hakukohde;
}) => {
  const { translateEntity } = useTranslations();

  const linkEnabled = useCheckPermission('READ_UPDATE')(hakukohde.tarjoajaOid);

  return (
    <>
      <span>
        {hakutoiveNumero}
        {'. '}
        {translateEntity(hakukohde.nimi)}
        {` ${NDASH} `}
      </span>
      {linkEnabled ? (
        <Link
          component={HakukohdeTabLink}
          hakuOid={hakukohde.hakuOid}
          hakukohdeOid={hakukohde.oid}
          tabRoute="perustiedot"
          prefetch={false}
          sx={{ textDecoration: 'underline' }}
        >
          {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
        </Link>
      ) : (
        <span>{translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}</span>
      )}
    </>
  );
};
