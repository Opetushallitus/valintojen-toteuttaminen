import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakukohdeTabLink } from '@/app/haku/[oid]/hakukohde/components/hakukohde-tab-link';
import { Link } from '@mui/material';

export const HakutoiveTitle = ({
  hakutoiveNumero,
  hakukohde,
}: {
  hakutoiveNumero: number;
  hakukohde: Hakukohde;
}) => {
  const { translateEntity } = useTranslations();
  return (
    <>
      <span>
        {hakutoiveNumero}
        {'. '}
        {translateEntity(hakukohde.nimi)}
        {' \u2013 '}
      </span>
      <Link
        component={HakukohdeTabLink}
        hakuOid={hakukohde.hakuOid}
        hakukohdeOid={hakukohde.oid}
        tabRoute="perustiedot"
        prefetch={false}
      >
        {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
      </Link>
    </>
  );
};
