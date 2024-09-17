import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { styled } from '@/app/theme';

const BoxHeading = styled(OphTypography)(({ theme }) => ({
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
        <OphTypography component="div" variant="body1">
          {subTitle}
        </OphTypography>
      )}
    </BoxHeading>
  );
};
