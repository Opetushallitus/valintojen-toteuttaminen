import { Box } from '@mui/material';
import { Typography } from '@opetushallitus/oph-design-system';
import { styled } from '@/app/theme';

const BoxHeading = styled(Typography)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  columnGap: theme.spacing(2),
  alignItems: 'center',
}));

export const AccordionBoxTitle = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle?: string;
}) => {
  return (
    <BoxHeading variant="h2" component="h3">
      <Box>{title}</Box>
      {subTitle && (
        <Typography component="div" variant="body1">
          {subTitle}
        </Typography>
      )}
    </BoxHeading>
  );
};
