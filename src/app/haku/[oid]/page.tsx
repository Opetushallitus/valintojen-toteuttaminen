'use server';

import { getTranslation } from "@/app/lib/common";
import { Hakukohde, getHaku, getHakukohteet } from "../../lib/kouta";
import Header from "@/app/components/header";

export default async function HakuPage({
  params
}: {
  params: { oid: string}
}) {

  const hakuNimi = await getHaku(params.oid);
  const hakukohteet = await getHakukohteet(params.oid);

  return (
    <main>
      <Header title={getTranslation(hakuNimi)} />
      <div className="mainContainer">
        {hakukohteet.map((hk: Hakukohde) => 
          <div key={hk.oid}>
            <p title={hk.organisaatioOid}>{getTranslation(hk.organisaatioNimi)}</p>
            <p title={hk.oid}>{getTranslation(hk.nimi)}</p>
          </div>)}
      </div>
    </main>
  );
}
