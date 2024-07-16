import Header from '@/app/components/header';
import { Spinner } from '@/app/components/spinner';

export default function Loading() {
  return <Header title={<Spinner />} isHome={true} />;
}
