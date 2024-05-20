'use client';

import { CSSProperties } from 'react';
import Header from '../components/header';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const titleSectionStyle: CSSProperties = {
  borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'flex-start',
  marginBottom: '2rem',
  padding: 0,
};

export default function HakuListLayout({
  children,
  controls,
}: {
  children: React.ReactNode;
  controls: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Header isHome={true} title={t('title')} />
      <main className="mainContainer">
        <div style={titleSectionStyle}>
          <h2 style={{ textAlign: 'left', margin: '0 0 1rem' }}>
            <AccessTimeIcon /> {t('haku.title')}
          </h2>
        </div>
        {controls}
        {children}
      </main>
    </>
  );
}
