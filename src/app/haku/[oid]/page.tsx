'use server';

import { getTranslation } from "@/app/lib/common";
import { Hakukohde, getHaku, getHakukohteet } from "../../lib/kouta";
import Header from "@/app/components/header";
import { HakukohdeList } from "./hakukohde-list";

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
      <div className="mainContainer" style={{display: 'flex', flexDirection: 'row'}}>
        <HakukohdeList hakukohteet={hakukohteet} />
        <div style={{alignSelf: 'center', width: '70%'}}>
          <h2>Valitse hakukohde</h2>
          <p>Kesken...</p>
        </div>
      </div>
    </main>
  );
}
