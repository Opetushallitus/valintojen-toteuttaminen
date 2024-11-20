import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { HakukohdeTabLink } from '@/app/haku/[oid]/hakukohde/components/hakukohde-tab-link';
import { Link } from '@mui/material';

export const HakutoiveTitle = ({
  hakutoiveNumero,
  hakuOid,
  hakukohde,
}: {
  hakutoiveNumero: number;
  hakuOid: string;
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
        hakuOid={hakuOid}
        hakukohdeOid={hakukohde.oid}
        tabRoute="perustiedot"
        prefetch={false}
      >
        {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
      </Link>
    </>
  );
};
