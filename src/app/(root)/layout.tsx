import { CSSProperties } from 'react';
import Header from '../components/header';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

const titleSectionStyle: CSSProperties = {
  borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'flex-start',
  marginBottom: '2rem',
  padding: 0,
};

export default async function HakuLayout({
  children,
  controls,
}: {
  children: React.ReactNode;
  controls: React.ReactNode;
}) {
  return (
    <>
      <Header isHome={true} />
      <main className="mainContainer">
        <div style={titleSectionStyle}>
          <h2 style={{ textAlign: 'left', margin: '0 0 1rem' }}>
            <AccessTimeIcon /> Haut
          </h2>
        </div>
        {controls}
        {children}
      </main>
    </>
  );
}
