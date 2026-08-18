import { RedirectWithSearch } from '@/components/redirect-with-search';

// Uudelleenohjaus hakukohteen juuresta perustiedot-välilehdelle (säilyttää query-parametrit).
export default function RedirectToPerustiedot() {
  return <RedirectWithSearch to="perustiedot" />;
}
