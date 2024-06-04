'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/kouta-types';
import { styled } from '@mui/material';
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

export const HakukohdeList = ({
  hakuOid,
  hakukohteet,
}: {
  hakuOid: string;
  hakukohteet: Hakukohde[];
}) => {
  const router = useRouter();
  const { translateEntity } = useTranslations();

  const selectHakukohde = (hakukohde: Hakukohde) => {
    router.push(`/haku/${hakuOid}/hakukohde/${hakukohde.oid}/perustiedot`);
  };

  return (
    <StyledList>
      {hakukohteet?.map((hk: Hakukohde) => (
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
