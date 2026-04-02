import { isToisenAsteenYhteisHaku } from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { UserPermissions } from '@/lib/permissions';
import { isInRange, toFinnishDate } from '@/lib/time-utils';

export const isValintojenToteuttaminenEstetty = ({
  haku,
  haunAsetukset,
  permissions,
}: {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  permissions: UserPermissions;
}) => {
  const estoaika = haunAsetukset?.valinnatEstettyOppilaitosvirkailijoilta;

  return (
    !permissions.hasOphCRUD &&
    isToisenAsteenYhteisHaku(haku) &&
    estoaika?.dateStart != null &&
    estoaika?.dateEnd != null &&
    isInRange(toFinnishDate(new Date()), estoaika.dateStart, estoaika.dateEnd)
  );
};

export const isPistesyottoAllowed = ({
  pistesyottoEnabled,
  permissions,
}: {
  pistesyottoEnabled?: boolean;
  permissions: UserPermissions;
}) => permissions.hasOphCRUD || Boolean(pistesyottoEnabled);

export const isHarkinnanvaraistenTallennusAllowed = ({
  haku,
  haunAsetukset,
  permissions,
}: {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  permissions: UserPermissions;
}) =>
  permissions.hasOphCRUD ||
  !isToisenAsteenYhteisHaku(haku) ||
  isInRange(
    toFinnishDate(new Date()),
    undefined,
    haunAsetukset?.harkinnanvarainenTallennusPaattyy,
  );
