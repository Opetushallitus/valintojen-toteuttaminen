'use client'

import { useEffect } from "react";
export default async function LoginComponent() {

  useEffect(() => {
      fetch('https://virkailija.untuvaopintopolku.fi/cas/login?service=https://virkailija.untuvaopintopolku.fi/kouta-internal/auth/login')
        .then(res => console.log(res));
  }, [])

  //const haut = await getHaut();

  return (
    <></>
  );
}