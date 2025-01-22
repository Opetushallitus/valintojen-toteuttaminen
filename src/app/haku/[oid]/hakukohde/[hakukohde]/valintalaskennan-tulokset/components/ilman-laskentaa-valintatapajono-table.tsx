'use client';
import {
  ListTable,
  ListTablePaginationProps,
} from '@/app/components/table/list-table';
import { createHakijaColumn } from '@/app/components/table/table-columns';
import { ListTableColumn } from '@/app/components/table/table-types';
import { JonoSijaWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { OphInput } from '@opetushallitus/oph-design-system';
import { useMemo } from 'react';
import { PisteetInput } from '@/app/components/pisteet-input';
import { useTuloksenTilaOptions } from '@/app/hooks/useTuloksenTilaOptions';
import {
  isAmmatillinenErityisopetus,
  isKorkeakouluHaku,
} from '@/app/lib/kouta';
import { Haku } from '@/app/lib/types/kouta-types';
import { LocalizedSelect } from '@/app/components/localized-select';
import {
  JonoTulosActorRef,
  useHakemusJonoTulos,
  useJonoTulosActorRef,
  useSelectedJarjestysperuste,
} from '@/app/lib/state/jono-tulos-state';
import { TuloksenTila } from '@/app/lib/types/laskenta-types';
import { Language } from '@/app/lib/localization/localization-types';

const TRANSLATIONS_PREFIX = 'valintalaskennan-tulokset.taulukko';

type JonoColumn = ListTableColumn<JonoSijaWithHakijaInfo>;

const JonosijaInput = ({
  jonoTulosActorRef,
  hakemusOid,
}: {
  jonoTulosActorRef: JonoTulosActorRef;
  hakemusOid: string;
}) => {
  const { onJonoTulosChange } = useJonoTulosActorRef(jonoTulosActorRef);

  const hakemusJonoTulos = useHakemusJonoTulos(jonoTulosActorRef, hakemusOid);
  const value = hakemusJonoTulos.jonosija ?? '';
  // TODO: Validoi syöte
  return (
    <OphInput
      type="number"
      value={value}
      sx={{ width: '80px' }}
      inputProps={{ min: 1 }}
      onChange={(e) =>
        onJonoTulosChange({
          hakemusOid,
          jonosija: e.target.value,
        })
      }
    />
  );
};

const TuloksenTilaSelect = ({
  jonoTulosActorRef,
  haku,
  hakemusOid,
}: {
  jonoTulosActorRef: JonoTulosActorRef;
  haku: Haku;
  hakemusOid: string;
}) => {
  const { onJonoTulosChange } = useJonoTulosActorRef(jonoTulosActorRef);

  const hakemusJonoTulos = useHakemusJonoTulos(jonoTulosActorRef, hakemusOid);
  const value = hakemusJonoTulos.tuloksenTila ?? '';

  const tuloksenTilaOptions = useTuloksenTilaOptions({
    harkinnanvarainen: !(
      isKorkeakouluHaku(haku) || isAmmatillinenErityisopetus(haku)
    ),
  });

  return (
    <LocalizedSelect
      value={value}
      options={tuloksenTilaOptions}
      sx={{ width: '100%' }}
      onChange={(e) => {
        const tuloksenTila = e.target.value;
        onJonoTulosChange({
          hakemusOid,
          tuloksenTila: tuloksenTila as TuloksenTila,
        });
      }}
    />
  );
};

const KokonaispisteetInput = ({
  jonoTulosActorRef,
  hakemusOid,
}: {
  jonoTulosActorRef: JonoTulosActorRef;
  hakemusOid: string;
}) => {
  const { onJonoTulosChange } = useJonoTulosActorRef(jonoTulosActorRef);
  const hakemusJonoTulos = useHakemusJonoTulos(jonoTulosActorRef, hakemusOid);
  const value = hakemusJonoTulos.pisteet ?? '';
  return (
    <PisteetInput
      value={value}
      onChange={(newPisteet) =>
        onJonoTulosChange({ hakemusOid, pisteet: newPisteet })
      }
    />
  );
};

const KuvausInput = ({
  jonoTulosActorRef,
  hakemusOid,
  language,
}: {
  jonoTulosActorRef: JonoTulosActorRef;
  hakemusOid: string;
  language: Language;
}) => {
  const { onJonoTulosChange } = useJonoTulosActorRef(jonoTulosActorRef);
  const hakemusJonoTulos = useHakemusJonoTulos(jonoTulosActorRef, hakemusOid);
  const value = hakemusJonoTulos.muutoksenSyy ?? {};

  return (
    <OphInput
      value={value?.[language] ?? ''}
      onChange={(e) => {
        onJonoTulosChange({
          hakemusOid,
          kuvaus: {
            ...value,
            [language]: e.target.value,
          },
        });
      }}
    />
  );
};

export const IlmanLaskentaaValintatapajonoTable = ({
  haku,
  jonosijat,
  setSort,
  sort,
  pagination,
  jonoTulosActorRef,
}: {
  haku: Haku;
  jonosijat: Array<JonoSijaWithHakijaInfo>;
  valintatapajonoOid: string;
  sort: string;
  setSort: (sort: string) => void;
  pagination: ListTablePaginationProps;
  jonoTulosActorRef: JonoTulosActorRef;
}) => {
  const [selectedJarjestysperuste] =
    useSelectedJarjestysperuste(jonoTulosActorRef);

  const columns: Array<JonoColumn> = useMemo(
    () => [
      ...(selectedJarjestysperuste === 'jonosija'
        ? [
            {
              title: `${TRANSLATIONS_PREFIX}.jonosija`,
              key: 'jonosija',
              render: ({ hakemusOid }) => {
                return (
                  <JonosijaInput
                    jonoTulosActorRef={jonoTulosActorRef}
                    hakemusOid={hakemusOid}
                  />
                );
              },
            } as JonoColumn,
          ]
        : []),
      createHakijaColumn(),
      {
        title: `${TRANSLATIONS_PREFIX}.valintatieto`,
        key: 'tuloksenTila',
        render: (props) => (
          <TuloksenTilaSelect
            jonoTulosActorRef={jonoTulosActorRef}
            haku={haku}
            hakemusOid={props.hakemusOid}
          />
        ),
      },
      ...(selectedJarjestysperuste === 'kokonaispisteet'
        ? [
            {
              title: `valintalaskennan-tulokset.kokonaispisteet`,
              key: 'pisteet',
              render: ({ hakemusOid }) => (
                <KokonaispisteetInput
                  jonoTulosActorRef={jonoTulosActorRef}
                  hakemusOid={hakemusOid}
                />
              ),
            } as JonoColumn,
          ]
        : []),
      {
        title: `${TRANSLATIONS_PREFIX}.kuvaus-fi`,
        key: 'muutoksenSyy.fi',
        render: ({ hakemusOid }) => (
          <KuvausInput
            jonoTulosActorRef={jonoTulosActorRef}
            hakemusOid={hakemusOid}
            language="fi"
          />
        ),
        sortable: false,
      },
      {
        title: `${TRANSLATIONS_PREFIX}.kuvaus-sv`,
        key: 'muutoksenSyy.sv',
        render: ({ hakemusOid }) => (
          <KuvausInput
            jonoTulosActorRef={jonoTulosActorRef}
            hakemusOid={hakemusOid}
            language="sv"
          />
        ),
        sortable: false,
      },
      {
        title: `${TRANSLATIONS_PREFIX}.kuvaus-en`,
        key: 'muutoksenSyy.en',
        render: ({ hakemusOid }) => (
          <KuvausInput
            jonoTulosActorRef={jonoTulosActorRef}
            hakemusOid={hakemusOid}
            language="en"
          />
        ),
        sortable: false,
      },
    ],
    [jonoTulosActorRef, selectedJarjestysperuste, haku],
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
