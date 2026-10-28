import { useTranslations } from '@/lib/localization/useTranslations';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { HakukohdeTabLink } from '@/components/hakukohde-tab-link';
import { Link } from '@mui/material';
import { NDASH } from '@/lib/constants';
import { useCheckHakukohdePermission } from '@/hooks/useHakukohdePermissions';

export const HakutoiveTitle = ({
  hakutoiveNumero,
  hakukohde,
}: {
  hakutoiveNumero: number;
  hakukohde: Hakukohde;
}) => {
  const { translateEntity } = useTranslations();

  const linkEnabled = useCheckHakukohdePermission(hakukohde, 'READ_UPDATE');

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
