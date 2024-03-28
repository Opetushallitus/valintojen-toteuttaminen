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

  return (
    <main>
      <div>
        <h1>Valintojen Toteuttaminen</h1>
        <HakuSelector haut={haut} hakutavat={hakutavat}/>
      </div>
    </main>
  );
}
