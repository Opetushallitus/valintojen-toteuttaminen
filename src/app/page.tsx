import { login } from "./lib/login-handler";
import { getHaut, Haku } from "./lib/kouta";

import { cookies } from 'next/headers';
import { configuration } from "./lib/configuration";
import { HakuSelector } from "./components/haku-selector";

export default async function Home() {

  //await login();

  const haut = await getHaut();
  console.log(haut);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1>Valintojen Toteuttaminen</h1>
        <HakuSelector haut={haut}/>
      </div>
    </main>
  );
}
