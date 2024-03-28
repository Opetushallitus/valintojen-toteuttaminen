'use server';

import { getHaku } from "../../lib/kouta";

export default async function HakuPage({
  params
}: {
  params: { oid: string}
}) {

  const hakuNimi = await getHaku(params.oid);

  return (
    <main>
      <div>
        <h1>Valintojen Toteuttaminen</h1>
        <h2>{hakuNimi}</h2>
      </div>
    </main>
  );
}
