import { login } from "./lib/login-handler";
import { getHaut, Haku } from "./lib/kouta";
import { cookies } from 'next/headers';
import { configuration } from "./lib/configuration";
import { HakuSelector } from "./components/haku-selector";
import { getHakutavat } from "./lib/koodisto";
import Header from "./components/header";

export default async function Home() {

  //await login();

  const haut = await getHaut();
  const hakutavat = await getHakutavat();

  return (
    <main>
      <Header isHome={true} />
      <div className="mainContainer">
        <h2 style={{textAlign: 'left'}}>Haut</h2>
        <HakuSelector haut={haut} hakutavat={hakutavat}/>
      </div>
    </main>
  );
}