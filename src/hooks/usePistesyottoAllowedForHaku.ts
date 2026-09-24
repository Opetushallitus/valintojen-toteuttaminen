import { useHaunParametrit } from '@/lib/valintalaskentakoostepalvelu/useHaunParametrit';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { isPistesyottoAllowed } from '@/lib/valintojen-toteuttaminen-access';

export const useIsPistesyottoAllowedForHaku = (hakuOid: string) => {
  const { data: haunParametrit } = useHaunParametrit({ hakuOid });
  const permissions = useUserPermissions();

  return isPistesyottoAllowed({
    pistesyottoEnabled: haunParametrit.pistesyottoEnabled,
    permissions,
  });
};
