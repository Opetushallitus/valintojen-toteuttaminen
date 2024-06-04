'use client';

import { styled } from '@mui/material';
import HakukohdeList from './hakukohde-list';
import HakukohdeSearch from './hakukohde-search';

const StyledPanel = styled('div')({
  width: '20vw',
  textAlign: 'left',
  minHeight: '85vh',
});

export const HakukohdePanel = ({ oid }: { oid: string }) => {
  return (
    <StyledPanel>
      <HakukohdeSearch />
      <HakukohdeList hakuOid={oid} />
    </StyledPanel>
  );
};

export default HakukohdePanel;
