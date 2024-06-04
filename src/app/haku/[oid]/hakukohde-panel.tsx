'use client';

import { getHakukohteet } from '@/app/lib/kouta';
import { CircularProgress, styled } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import HakukohdeList from './hakukohde-list';
import HakukohdeSearch from './hakukohde-search';

const StyledPanel = styled('div')({
  width: '20vw',
  textAlign: 'left',
});

export const HakukohdePanel = ({ oid }: { oid: string }) => {
  const { isLoading, data: hakukohteet } = useQuery({
    queryKey: ['getHakukohteet', oid],
    queryFn: () => getHakukohteet(oid),
  });

  return (
    <StyledPanel>
      <HakukohdeSearch />
      {isLoading && <CircularProgress />}
      {!isLoading && hakukohteet && (
        <HakukohdeList hakuOid={oid} hakukohteet={hakukohteet} />
      )}
    </StyledPanel>
  );
};

export default HakukohdePanel;
