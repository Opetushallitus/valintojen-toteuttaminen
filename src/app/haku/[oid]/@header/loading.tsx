import { ClientSpinner } from '@/app/components/client-spinner';
import { Header } from '@/app/components/header';

export default function Loading() {
  return <Header title={<ClientSpinner />} isHome={true} />;
}
