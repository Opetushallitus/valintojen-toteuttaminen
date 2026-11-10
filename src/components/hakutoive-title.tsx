import { useTranslations } from '@/lib/localization/useTranslations';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { HakukohdeTabLink } from '@/components/hakukohde-tab-link';
import { Link } from '@mui/material';
import { NDASH } from '@/lib/constants';

export const HakutoiveTitle = ({
  hakutoiveNumero,
  hakukohde,
  linkEnabled,
}: {
  hakutoiveNumero: number;
  hakukohde: Hakukohde;
  linkEnabled: boolean;
}) => {
  const { translateEntity } = useTranslations();

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
