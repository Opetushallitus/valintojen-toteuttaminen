'use client';

import { useTranslations } from '@/app/hooks/useTranslations';

export default function HakuPage() {
  const { t } = useTranslations();

  return (
    <div style={{ alignSelf: 'center', width: '70%', padding: '1rem 2rem' }}>
      <h2>{t('hakukohde.valitse')}</h2>
    </div>
  );
}
