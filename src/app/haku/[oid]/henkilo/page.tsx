'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { ListAlt } from '@mui/icons-material';
import { NoResults } from '@/components/no-results';

export default function ValitseHenkiloPage() {
  const { t } = useTranslations();
  return <NoResults text={t('henkilo.valitse')} icon={<ListAlt />} />;
}
