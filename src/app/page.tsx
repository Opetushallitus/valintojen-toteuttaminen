'use server'
import { HakuSelector } from "./components/haku-selector";
import Header from "./components/header";

export default async function Home() {
  return (
    <main>
      <Header isHome={true} />
      <div className="mainContainer">
        <h2 style={{textAlign: 'left'}}>Haut</h2>
        <HakuSelector />
      </div>
    </main>
  );
}
