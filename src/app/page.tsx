'use server';
import { CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import Header from './components/header';
import { getHakutavat } from './lib/koodisto';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { CSSProperties } from 'react';
import { FullSpinner } from './components/full-spinner';

const titleSectionStyle: CSSProperties = {
  borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'flex-start',
  marginBottom: '2rem',
  padding: 0,
};

const HakuFilters = dynamic(() => import('./components/haku-filters'), {
  ssr: false,
  loading: () => <FullSpinner />,
});

export default async function Home() {
  const hakutavat = await getHakutavat();

  return (
    <>
      <Header isHome={true} />
      <main className="mainContainer">
        <div style={titleSectionStyle}>
          <h2 style={{ textAlign: 'left', margin: '0 0 1rem' }}>
            <AccessTimeIcon /> Haut
          </h2>
        </div>
        <HakuFilters hakutavat={hakutavat} />
      </main>
    </>
  );
}
