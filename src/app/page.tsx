import { login } from "./lib/login-handler";
import { getHaut, Haku } from "./lib/kouta";
import { cookies } from 'next/headers';
import { configuration } from "./lib/configuration";
import { HakuSelector } from "./components/haku-selector";
import { getHakutavat } from "./lib/koodisto";

export default async function Home() {

  //await login();

  const haut = await getHaut();
  const hakutavat = await getHakutavat();

  const mainContainerStyle = {
    border: '1px solid rgba(0, 0, 0, 0.15)', 
    backgroundColor: 'white',
    padding: '2rem',
  };

  return (
    <main>
      <div>
        <h1 style={{textAlign: 'left'}}>Valintojen Toteuttaminen</h1>
        <div style={mainContainerStyle}>
          <HakuSelector haut={haut} hakutavat={hakutavat}/>
        </div>
      </div>
    </main>
  );
}
