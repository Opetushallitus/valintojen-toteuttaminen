'use client';

import ListTable, { makeCountColumn } from '@/app/components/table/list-table';
import { ValintatapajonoTulos } from '@/app/lib/valinta-tulos-service';

export const ValintatapajonotTable = ({
  valintatapajonoTulokset,
}: {
  valintatapajonoTulokset: ValintatapajonoTulos[];
}) => {
  const columns = [
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Sijoittelun käyttämät aloituspaikat',
      key: 'sijoittelun-aloituspaikat',
      amountProp: 'sijoittelunAloituspaikat',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Hyväksytyt yht',
      key: 'hyvaksytyt',
      amountProp: 'hyvaksytty',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Joista ehdollisesti hyväksytyt',
      key: 'ehdollisesti-hyvaksytyt',
      amountProp: 'ehdollisestiHyvaksytty',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Harkinnanvaraisesti hyväksytyt',
      key: 'harkinnanvaraisesti-hyvaksytyt',
      amountProp: 'harkinnanvaraisestiHyvaksytty',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Varasijoilla',
      key: 'varasijoilla',
      amountProp: 'varasijoilla',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Paikan vastaanottaneet',
      key: 'vastaanottaneet',
      amountProp: 'vastaanottaneet',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Paikan peruneet',
      key: 'peruneet',
      amountProp: 'paikanPeruneet',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Alin hyväksytty pistemäärä',
      key: 'pisteraja',
      amountProp: 'pisteraja',
    }),
  ];

  return <ListTable columns={columns} rows={valintatapajonoTulokset} />;
};
