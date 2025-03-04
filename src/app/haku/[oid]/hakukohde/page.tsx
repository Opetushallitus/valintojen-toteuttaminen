'use client';

import { useTranslations } from '@/app/lib/localization/useTranslations';
import { ListAlt } from '@mui/icons-material';
import { NoResults } from '@/app/components/no-results';

export default function HakukohdePage() {
  const { t } = useTranslations();
  return <NoResults text={t('hakukohde.valitse')} icon={<ListAlt />} />;
}
