import { ClientSpinner } from '@/components/client-spinner';
import { Header } from '@/components/header';

export default function Loading() {
  return <Header title={<ClientSpinner />} isHome={true} />;
}
