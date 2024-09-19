import { Box } from '@mui/material';
import { IconCircle } from './icon-circle';
import { FolderOutlined } from '@mui/icons-material';
import { styled } from '../lib/theme';

const Wrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
});

export const NoResults = ({
  text,
  icon,
}: {
  text: string;
  icon?: React.ReactNode;
}) => {
  return (
    <Wrapper>
      <IconCircle>{icon ?? <FolderOutlined />}</IconCircle>
      <Box>{text}</Box>
    </Wrapper>
  );
};
