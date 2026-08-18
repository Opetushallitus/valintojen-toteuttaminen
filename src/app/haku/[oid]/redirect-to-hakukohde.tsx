import { RedirectWithSearch } from '@/components/redirect-with-search';

// Uudelleenohjaus /haku/:oid -> /haku/:oid/hakukohde (säilyttää query-parametrit).
export default function RedirectToHakukohde() {
  return <RedirectWithSearch to="hakukohde" />;
}
