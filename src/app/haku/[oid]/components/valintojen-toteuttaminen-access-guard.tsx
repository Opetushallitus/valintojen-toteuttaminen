'use client';

import { NoResults } from '@/components/no-results';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { isValintojenToteuttaminenEstetty } from '@/lib/valintojen-toteuttaminen-access';
import { DoNotDisturb } from '@mui/icons-material';

export const ValintojenToteuttaminenAccessGuard = ({
  hakuOid,
  tabName,
  children,
}: {
  hakuOid: string;
  tabName: 'hakukohde' | 'henkilo';
  children: React.ReactNode;
}) => {
  const { t } = useTranslations();
  const permissions = useUserPermissions();
  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });

  return isValintojenToteuttaminenEstetty({
    haku,
    haunAsetukset,
    permissions,
  }) ? (
    <NoResults
      icon={<DoNotDisturb />}
      text={t('hakukohde-tabs.not-visible', {
        tabName: t(`haku-tabs.${tabName}`),
      })}
    />
  ) : (
    children
  );
};
