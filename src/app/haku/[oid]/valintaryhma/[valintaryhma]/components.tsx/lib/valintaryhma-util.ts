import { ValintaryhmaHakukohteilla } from '@/app/lib/types/valintaperusteet-types';

export function findParent(
  ryhma: ValintaryhmaHakukohteilla,
  ryhmat: ValintaryhmaHakukohteilla[],
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
