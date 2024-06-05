'use client';

import { styled, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HakukohdeList from './hakukohde-list';
import HakukohdeSearch from './hakukohde-search';
import { useState } from 'react';

const StyledPanel = styled('div')({
  width: '20vw',
  textAlign: 'left',
  minHeight: '85vh',
  position: 'relative',
});

const MinimizedPanel = styled('div')({
  width: '5vw'
});

export const HakukohdePanel = ({ oid }: { oid: string }) => {

  const [ minimized, setMinimized ] = useState(false);

  return (
    <>
      {!minimized &&
        <StyledPanel>
          <IconButton sx={{position: 'absolute', top: '5px', right: '5px'}}><CloseIcon /></IconButton>
          <HakukohdeSearch />
          <HakukohdeList hakuOid={oid} />
        </StyledPanel>
      }
    </>

  );
};

export default HakukohdePanel;
