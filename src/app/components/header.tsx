import { CSSProperties } from "react";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Link as MuiLink } from "@mui/material";

export type HeaderProps = 
{
  title?: string,
  isHome?: boolean,
}

export default function Header({title = 'Valintojen toteuttaminen', isHome = false} : HeaderProps) {

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
    alignContent: 'center',
    columnGap: '0.8rem'
  };

  const titleStyle: CSSProperties = {
    alignSelf: 'center',
    fontSize: TITLE_SIZE,
  };

  return (
    <header>
      <div style={headerStyle}>
        {!isHome &&
          <MuiLink href="/" sx={titleStyle}>
            <HomeOutlinedIcon sx={{border: '1px solid', padding: '3px', borderRadius: '2px'}}/>
          </MuiLink>}
        <h1 style={titleStyle}>{!isHome ? '> ' : '' }{title}</h1>
      </div>
      <div style={{height: HEADER_HEIGHT, marginBottom: '4rem'}} />
    </header>
  );
};
