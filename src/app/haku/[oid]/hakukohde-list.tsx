'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { getHakukohteet } from '@/app/lib/kouta';
import { Hakukohde } from '@/app/lib/kouta-types';
import { CircularProgress, styled } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const StyledList = styled('div')({
  width: '20vw',
  textAlign: 'left',
});

const StyledItem = styled('div')({
  '.organizationLabel': {
    fontWeight: 500,
  },

  '&:nth-of-type(even)': {
    backgroundColor: '#f5f5f5',
  },
  '&:hover': {
    backgroundColor: '#e0f2fd',
  },
});

export const HakukohdeList = ({ oid }: { oid: string }) => {
  const router = useRouter();
  const { translateEntity } = useTranslations();

  const selectHakukohde = (hakukohde: Hakukohde) => {
    router.push(`/haku/${oid}/hakukohde/${hakukohde.oid}/perustiedot`);
  };

  const { data: userPermissions } = useUserPermissions();

  const { isLoading, data: hakukohteet } = useQuery({
    queryKey: ['getHakukohteet', oid],
    queryFn: () => getHakukohteet(oid, userPermissions),
  });

  return (
    <StyledList>
      {isLoading && <CircularProgress />}
      {!isLoading &&
        hakukohteet?.map((hk: Hakukohde) => (
          <StyledItem key={hk.oid} onClick={() => selectHakukohde(hk)}>
            <p title={hk.organisaatioOid} className="organizationLabel">
              {hk.jarjestyspaikkaHierarkiaNimi
                ? translateEntity(hk.jarjestyspaikkaHierarkiaNimi)
                : ''}
            </p>
            <p title={hk.oid}>{translateEntity(hk.nimi)}</p>
          </StyledItem>
        ))}
    </StyledList>
  );
};

export default HakukohdeList;
