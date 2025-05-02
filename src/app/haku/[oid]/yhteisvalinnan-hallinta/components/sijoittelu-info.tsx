import { InfoOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';

export const SijoitteluInfo = ({
  text,
  sxProps,
}: {
  text: string;
  sxProps?: React.CSSProperties;
}) => {
  return (
    <Typography
      variant="body1"
      sx={{
        ...sxProps,
        display: 'flex',
        alignItems: 'flex-start',
        marginTop: 1,
        columnGap: 1,
      }}
    >
      <InfoOutlined htmlColor={ophColors.blue2} />
      {text}
    </Typography>
  );
};
