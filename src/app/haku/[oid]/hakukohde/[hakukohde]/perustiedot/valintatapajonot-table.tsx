'use client';

import { ListTable } from '@/app/components/table/list-table';
import {
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { isToisenAsteenYhteisHaku } from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';
import { ValintatapajonoTulos } from '@/app/lib/types/sijoittelu-types';

export const ValintatapajonotTable = ({
  valintatapajonoTulokset,
  haku,
}: {
  valintatapajonoTulokset: ValintatapajonoTulos[];
  haku: Haku;
}) => {
  const columns = [
    makeGenericColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.valintatapajono',
      key: 'valintatapajono',
      valueProp: 'nimi',
    }),
    makeGenericColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.aloituspaikat',
      key: 'sijoittelun-aloituspaikat',
      valueProp: 'sijoittelunAloituspaikat',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.hyvaksytyt',
      key: 'hyvaksytyt',
      amountProp: 'hyvaksytty',
    }),
    isToisenAsteenYhteisHaku(haku)
      ? makeCountColumn<ValintatapajonoTulos>({
          title: 'perustiedot.taulukko.harkinnanvaraiset',
          key: 'harkinnanvaraisesti-hyvaksytyt',
          amountProp: 'harkinnanvaraisestiHyvaksytty',
        })
      : makeCountColumn<ValintatapajonoTulos>({
          title: 'perustiedot.taulukko.ehdolliset',
          key: 'ehdollisesti-hyvaksytyt',
          amountProp: 'ehdollisestiHyvaksytty',
        }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.varasijoilla',
      key: 'varasijoilla',
      amountProp: 'varasijoilla',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.vastaanottaneet',
      key: 'vastaanottaneet',
      amountProp: 'vastaanottaneet',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.peruneet',
      key: 'peruneet',
      amountProp: 'paikanPeruneet',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'perustiedot.taulukko.pisteraja',
      key: 'pisteraja',
      amountProp: 'pisteraja',
    }),
  ];

  return (
    <ListTable
      rowKeyProp="oid"
      columns={columns}
      rows={valintatapajonoTulokset}
    />
  );
};
