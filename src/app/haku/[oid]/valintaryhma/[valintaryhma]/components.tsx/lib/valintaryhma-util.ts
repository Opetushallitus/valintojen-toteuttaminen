import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';

export function findParent(
  ryhma: ValintaryhmaHakukohteilla,
  ryhmat: Array<ValintaryhmaHakukohteilla>,
): ValintaryhmaHakukohteilla | null {
  const parent =
    ryhmat.find((r) => ryhma.parentOid === r.oid) ||
    ryhmat
      .flatMap((r) => r.alaValintaryhmat)
      .find((r) => ryhma.parentOid === r.oid);
  return (
    parent ||
    findParent(
      ryhma,
      ryhmat.flatMap((r) => r.alaValintaryhmat),
    )
  );
}
