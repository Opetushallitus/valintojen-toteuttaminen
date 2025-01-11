'use client';
import {
  ListTable,
  ListTablePaginationProps,
} from '@/app/components/table/list-table';
import { createHakijaColumn } from '@/app/components/table/table-columns';
import { ListTableColumn } from '@/app/components/table/table-types';
import { JonoSijaWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { OphInput, OphSelect } from '@opetushallitus/oph-design-system';
import { useMemo } from 'react';
import { ArvoType } from './valintatapajono-content';
import { PisteetInput } from '@/app/components/pisteet-input';
import { useTuloksenTilaOptions } from '@/app/hooks/useTuloksenTilaOptions';
import {
  isAmmatillinenErityisopetus,
  isKorkeakouluHaku,
} from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';

const TRANSLATIONS_PREFIX = 'valintalaskennan-tulokset.taulukko';

const JonosijaInput = ({ value }: { value?: number }) => {
  // TODO: Validoi syöte
  return (
    <OphInput
      type="number"
      value={value}
      sx={{ width: '80px' }}
      inputProps={{ min: 1 }}
    />
  );
};

const jonosijaColumn: ListTableColumn<JonoSijaWithHakijaInfo> = {
  title: `${TRANSLATIONS_PREFIX}.jonosija`,
  key: 'jonosija',
  render: ({ jonosija }) => {
    return <JonosijaInput value={jonosija} />;
  },
};

const KuvausInput = ({ value }: { value: string }) => {
  return <OphInput value={value} />;
};

type JonoColumn = ListTableColumn<JonoSijaWithHakijaInfo>;

export const IlmanLaskentaaValintatapajonoTable = ({
  haku,
  jonosijat,
  setSort,
  sort,
  pagination,
  arvoType,
}: {
  haku: Haku;
  jonosijat: Array<JonoSijaWithHakijaInfo>;
  valintatapajonoOid: string;
  sort: string;
  setSort: (sort: string) => void;
  pagination: ListTablePaginationProps;
  arvoType: ArvoType;
}) => {
  const tuloksenTilaOptions = useTuloksenTilaOptions({
    harkinnanvarainen: !(
      isKorkeakouluHaku(haku) || isAmmatillinenErityisopetus(haku)
    ),
  });

  const columns: Array<JonoColumn> = useMemo(
    () => [
      ...(arvoType === 'jonosija' ? [jonosijaColumn] : []),
      createHakijaColumn(),
      {
        title: `${TRANSLATIONS_PREFIX}.valintatieto`,
        key: 'tuloksenTila',
        render: (props) => (
          <OphSelect
            value={props.tuloksenTila}
            options={tuloksenTilaOptions}
            onChange={() => {}}
          />
        ),
      },
      ...(arvoType === 'kokonaispisteet'
        ? [
            {
              title: `valintalaskennan-tulokset.kokonaispisteet`,
              key: 'pisteet',
              render: ({ pisteet }) => <PisteetInput value={pisteet} />,
            } as JonoColumn,
          ]
        : []),
      {
        title: `${TRANSLATIONS_PREFIX}.kuvaus-fi`,
        key: 'muutoksenSyy.fi',
        render: (props) => <KuvausInput value={props.muutoksenSyy?.fi ?? ''} />,
        sortable: false,
      },
      {
        title: `${TRANSLATIONS_PREFIX}.kuvaus-sv`,
        key: 'muutoksenSyy.sv',
        render: (props) => <KuvausInput value={props.muutoksenSyy?.sv ?? ''} />,
        sortable: false,
      },
      {
        title: `${TRANSLATIONS_PREFIX}.kuvaus-en`,
        key: 'muutoksenSyy.en',
        render: (props) => <KuvausInput value={props.muutoksenSyy?.en ?? ''} />,
        sortable: false,
      },
    ],
    [tuloksenTilaOptions, arvoType],
  );

  return (
    <ListTable
      rowKeyProp="hakijaOid"
      columns={columns}
      rows={jonosijat}
      sort={sort}
      setSort={setSort}
      pagination={pagination}
    />
  );
};
