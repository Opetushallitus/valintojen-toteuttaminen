'use client';

import { ListTable } from '@/components/table/list-table';
import {
  makeCountColumn,
  makeGenericColumn,
} from '@/components/table/table-columns';
import {
  isKorkeakouluHaku,
  isToisenAsteenYhteisHaku,
} from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import { SijoittelunValintatapajonoTulos } from '@/lib/types/sijoittelu-types';
import { isNonNull } from 'remeda';

export const ValintatapajonotTable = ({
  valintatapajonoTulokset,
  haku,
}: {
  valintatapajonoTulokset: Array<SijoittelunValintatapajonoTulos>;
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
    isKorkeakouluHaku(haku)
      ? makeCountColumn<SijoittelunValintatapajonoTulos>({
          title: 'perustiedot.taulukko.ehdollisesti-vastaanottaneet',
          key: 'ehdollisesti-vastaanottaneet',
          amountProp: 'ehdollisestiVastaanottaneet',
        })
      : null,
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
  ].filter(isNonNull);

  return (
    <ListTable
      rowKeyProp="oid"
      columns={columns}
      rows={valintatapajonoTulokset}
    />
  );
};
