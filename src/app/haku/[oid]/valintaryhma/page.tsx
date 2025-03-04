'use client';
import { useTranslations } from '@/app/lib/localization/useTranslations';
import { ListAlt } from '@mui/icons-material';
import { NoResults } from '@/app/components/no-results';

export default function ValitseValintaryhmaPage() {
  const { t } = useTranslations();
  return <NoResults text={t('valintaryhmittain.valitse')} icon={<ListAlt />} />;
}
