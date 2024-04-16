'use server'

import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import Header from "./components/header";
import { getHakutavat } from "./lib/koodisto";

const HakuSelector = dynamic(() => import("./components/haku-selector"), {
  ssr: false,
  loading: () => <CircularProgress />
});

const mainContainerStyle = {
  border: '1px solid rgba(0, 0, 0, 0.15)', 
  backgroundColor: 'white',
  padding: '2rem',
};

export default async function Home() {
  const hakutavat = await getHakutavat();

  return (
    <main>
      <Header isHome={true} />
      <div className="mainContainer">
        <h2 style={{textAlign: 'left'}}>Haut</h2>
        <HakuSelector hakutavat={hakutavat}/>
      </div>
    </main>
  );
}
