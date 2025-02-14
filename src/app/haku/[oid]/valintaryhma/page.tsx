'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ListAlt } from '@mui/icons-material';
import { NoResults } from '@/app/components/no-results';

export default function ValitseValintaryhmaPage() {
  const { t } = useTranslations();
  return <NoResults text={t('valintaryhma.valitse')} icon={<ListAlt />} />;
}
