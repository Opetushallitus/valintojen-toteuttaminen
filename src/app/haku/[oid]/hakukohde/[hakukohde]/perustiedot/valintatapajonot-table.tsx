'use client';

import ListTable, {
  makeCountColumn,
  makeGenericColumn,
  makeNameColumn,
} from '@/app/components/table/list-table';
import { isToisenAsteenYhteisHaku } from '@/app/lib/kouta';
import { Haku } from '@/app/lib/kouta-types';
import { ValintatapajonoTulos } from '@/app/lib/valinta-tulos-service';

export const ValintatapajonotTable = ({
  valintatapajonoTulokset,
  haku,
}: {
  valintatapajonoTulokset: ValintatapajonoTulos[];
  haku: Haku;
}) => {
  const columns = [
    makeNameColumn(),
    makeGenericColumn<ValintatapajonoTulos>({
      title: 'Sijoittelun käyttämät aloituspaikat',
      key: 'sijoittelun-aloituspaikat',
      valueProp: 'sijoittelunAloituspaikat',
    }),
    makeCountColumn<ValintatapajonoTulos>({
      title: 'Hyväksytyt yht',
      key: 'hyvaksytyt',
      amountProp: 'hyvaksytty',
    }),
    isToisenAsteenYhteisHaku(haku)
      ? makeCountColumn<ValintatapajonoTulos>({
          title: 'Harkinnanvaraisesti hyväksytyt',
          key: 'harkinnanvaraisesti-hyvaksytyt',
          amountProp: 'harkinnanvaraisestiHyvaksytty',
        })
      : makeCountColumn<ValintatapajonoTulos>({
          title: 'Joista ehdollisesti hyväksytyt',
          key: 'ehdollisesti-hyvaksytyt',
          amountProp: 'ehdollisestiHyvaksytty',
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
