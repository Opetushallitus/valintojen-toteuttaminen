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
  const dateStart = estoaika?.dateStart ?? undefined;
  const dateEnd = estoaika?.dateEnd ?? undefined;

  return (
    !permissions.hasOphCRUD &&
    isToisenAsteenYhteisHaku(haku) &&
    (dateStart !== undefined || dateEnd !== undefined) &&
    isInRange(toFinnishDate(new Date()), dateStart, dateEnd)
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
