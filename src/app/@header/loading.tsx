import Header from '@/app/components/header';
import { CircularProgress } from '@mui/material';

export default function Loading() {
  return <Header title={<CircularProgress />} isHome={true} />;
}
