'use client';

import { useTranslation } from 'react-i18next';

export default function HakuPage() {
  const { t } = useTranslation();

  return (
    <div style={{ alignSelf: 'center', width: '70%', padding: '1rem 2rem' }}>
      <h2>Valitse hakukohde</h2>
      <p>{t('title')}</p>
    </div>
  );
}
