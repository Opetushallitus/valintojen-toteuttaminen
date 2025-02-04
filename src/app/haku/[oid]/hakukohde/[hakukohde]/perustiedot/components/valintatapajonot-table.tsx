'use client';

import { ListTable } from '@/app/components/table/list-table';
import {
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { isToisenAsteenYhteisHaku } from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';
import { SijoittelunValintatapajonoTulos } from '@/app/lib/types/sijoittelu-types';

export const ValintatapajonotTable = ({
  valintatapajonoTulokset,
  haku,
}: {
  valintatapajonoTulokset: SijoittelunValintatapajonoTulos[];
  haku: Haku;
}) => {
  const columns = [
    makeGenericColumn<SijoittelunValintatapajonoTulos>({
      title: 'perustiedot.taulukko.valintatapajono',
      key: 'valintatapajono',
      valueProp: 'nimi',
    }),
    makeGenericColumn<SijoittelunValintatapajonoTulos>({
      title: 'perustiedot.taulukko.aloituspaikat',
      key: 'sijoittelun-aloituspaikat',
      valueProp: 'sijoittelunAloituspaikat',
    }),
    makeCountColumn<SijoittelunValintatapajonoTulos>({
      title: 'perustiedot.taulukko.hyvaksytyt',
      key: 'hyvaksytyt',
      amountProp: 'hyvaksytty',
    }),
    isToisenAsteenYhteisHaku(haku)
      ? makeCountColumn<SijoittelunValintatapajonoTulos>({
          title: 'perustiedot.taulukko.harkinnanvaraiset',
          key: 'harkinnanvaraisesti-hyvaksytyt',
          amountProp: 'harkinnanvaraisestiHyvaksytty',
        })
      : makeCountColumn<SijoittelunValintatapajonoTulos>({
          title: 'perustiedot.taulukko.ehdolliset',
          key: 'ehdollisesti-hyvaksytyt',
          amountProp: 'ehdollisestiHyvaksytty',
        }),
    makeCountColumn<SijoittelunValintatapajonoTulos>({
      title: 'perustiedot.taulukko.varasijoilla',
      key: 'varasijoilla',
      amountProp: 'varasijoilla',
    }),
    makeCountColumn<SijoittelunValintatapajonoTulos>({
      title: 'perustiedot.taulukko.vastaanottaneet',
      key: 'vastaanottaneet',
      amountProp: 'vastaanottaneet',
    }),
    makeCountColumn<SijoittelunValintatapajonoTulos>({
      title: 'perustiedot.taulukko.peruneet',
      key: 'peruneet',
      amountProp: 'paikanPeruneet',
    }),
    makeCountColumn<SijoittelunValintatapajonoTulos>({
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
