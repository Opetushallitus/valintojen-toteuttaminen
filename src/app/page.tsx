'use server';
import { getHakutavat } from './lib/koodisto';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { CSSProperties } from 'react';
import HakuFilters from './components/haku-filters';

const titleSectionStyle: CSSProperties = {
  borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'flex-start',
  marginBottom: '2rem',
  padding: 0,
};

export default async function Home() {
  const hakutavat = await getHakutavat();

  return (
    <main className="mainContainer">
      <div style={titleSectionStyle}>
        <h2 style={{ textAlign: 'left', margin: '0 0 1rem' }}>
          <AccessTimeIcon /> Haut
        </h2>
      </div>
      <HakuFilters hakutavat={hakutavat} />
    </main>
  );
}
