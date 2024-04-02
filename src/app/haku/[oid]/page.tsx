'use server';

import { getTranslation } from "@/app/lib/common";
import { Hakukohde, getHaku, getHakukohteet } from "../../lib/kouta";

export default async function HakuPage({
  params
}: {
  params: { oid: string}
}) {

  const hakuNimi = await getHaku(params.oid);
  const hakukohteet = await getHakukohteet(params.oid);

  return (
    <main>
      <div>
        <h1>Valintojen Toteuttaminen</h1>
        <h2>{getTranslation(hakuNimi)}</h2>
        <ul>
          {hakukohteet.map((hk: Hakukohde) => 
            <li key={hk.oid}>{getTranslation(hk.nimi)}</li>)}
        </ul>
      </div>
    </main>
  );
}
