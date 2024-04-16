"use client";

import { getTranslation } from "@/app/lib/common";
import Header from "@/app/components/header";
import { HakukohdeList } from "./hakukohde-list";
import { getHaku, getHakukohteet } from "@/app/lib/kouta";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function HakuPage({ params }: { params: { oid: string } }) {
  const { data: hakuNimi } = useSuspenseQuery({
    queryKey: ["getHaku", params.oid],
    queryFn: () => getHaku(params.oid),
  });

  const { data: hakukohteet } = useSuspenseQuery({
    queryKey: ["getHakukohteet", params.oid],
    queryFn: () => getHakukohteet(params.oid),
  });

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
