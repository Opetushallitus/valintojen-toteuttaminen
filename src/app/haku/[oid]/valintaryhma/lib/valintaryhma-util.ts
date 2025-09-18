import { ValintaryhmaHakukohteilla } from '@/lib/valintaperusteet/valintaperusteet-types';
import { unique } from 'remeda';

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

export function findHakukohteetRecursively(
  ryhma: ValintaryhmaHakukohteilla,
): Array<string> {
  return unique(
    ryhma.hakukohteet.concat(
      ryhma.alaValintaryhmat.flatMap(findHakukohteetRecursively),
    ),
  );
}

export function hasRightToValintaryhmaOrAlaValintaryhma(
  ryhma: ValintaryhmaHakukohteilla,
): boolean {
  return (
    ryhma.userHasWriteAccess ||
    ryhma.alaValintaryhmat.some(hasRightToValintaryhmaOrAlaValintaryhma)
  );
}
