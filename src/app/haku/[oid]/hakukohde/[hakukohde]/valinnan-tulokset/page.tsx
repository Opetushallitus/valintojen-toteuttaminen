'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { TabContainer } from '../components/tab-container';

export default function ValinnanTuloksetTab() {
  const { t } = useTranslations();

  return (
    <TabContainer>
      <h3>{t('valinnan-tulokset.otsikko')}</h3>
    </TabContainer>
  );
}
