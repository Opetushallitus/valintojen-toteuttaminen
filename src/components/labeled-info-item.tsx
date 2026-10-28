import { Box } from '@mui/material';
import React, { useId } from 'react';
import { styled } from '@/lib/theme';

const InfoLabel = styled('label')(({ theme }) => ({
  ...theme.typography.label,
}));

export const LabeledInfoItem = ({
  label,
  labelInfo,
  value,
}: {
  label: string;
  // Otsikon perässä näytettävä lisäsisältö, esim. lisätietopainike
  labelInfo?: React.ReactNode;
  value: React.ReactNode;
}) => {
  const labelId = useId();
  const infoLabel = <InfoLabel id={labelId}>{label}</InfoLabel>;
  return (
    <div>
      {labelInfo ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {infoLabel}
          {/* Lisäsisältö (esim. 24px korkea painike) on otsikkoa korkeampi. Nollakorkuinen kääre
              keskittää sen otsikon kanssa ilman, että rivi ja siten koko kohta kasvaa. */}
          <Box sx={{ display: 'flex', alignItems: 'center', height: 0 }}>
            {labelInfo}
          </Box>
        </Box>
      ) : (
        infoLabel
      )}
      <Box aria-labelledby={labelId}>{value}</Box>
    </div>
  );
};
