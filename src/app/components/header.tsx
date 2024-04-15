import { CSSProperties } from "react";

export type HeaderProps = 
{
  title?: string,
  isHome?: boolean,
}

export default async function Header({title = 'Valintojen toteuttaminen', isHome = false} : HeaderProps) {

  const HEADER_HEIGHT = '4rem';
  const TITLE_SIZE = isHome? '2rem' : '1.5rem';

  const headerStyle: CSSProperties = {
    borderBottom: '1px solid rgba(0, 0, 0, 0.15)', 
    backgroundColor: 'white',
    padding: '0.5rem 3vw',
    width: '100svw',
    left: 0,
    position: 'absolute',
    height: HEADER_HEIGHT,
    display: 'flex',
    textAlign: 'left',
    justifyContent: 'flex-start',
    alignContent: 'center'
  };

  const titleStyle: CSSProperties = {
    alignSelf: 'center',
    fontSize: TITLE_SIZE,
  };

  return (
    <header>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{title}</h1>
      </div>
      <div style={{height: HEADER_HEIGHT, marginBottom: '4rem'}} />
    </header>
  );
};
