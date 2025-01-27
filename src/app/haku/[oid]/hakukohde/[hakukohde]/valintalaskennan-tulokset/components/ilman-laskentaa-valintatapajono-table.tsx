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
import { useTranslations } from '@/app/hooks/useTranslations';

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
  const tuloksenTila = hakemusJonoTulos.tuloksenTila;
  const value = hakemusJonoTulos.jonosija ?? '';
  const { t } = useTranslations();
  return (
    <PisteetInput
      disabled={tuloksenTila === TuloksenTila.HYLATTY}
      value={value}
      ariaLabel={t('valintalaskennan-tulokset.taulukko.jonosija')}
      onChange={(arvo) =>
        onJonoTulosChange({
          hakemusOid,
          jonosija: arvo,
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
  const tuloksenTila = hakemusJonoTulos.tuloksenTila;
  const value = hakemusJonoTulos.pisteet ?? '';

  return (
    <PisteetInput
      value={value}
      disabled={tuloksenTila === TuloksenTila.HYLATTY}
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
  label,
}: {
  jonoTulosActorRef: JonoTulosActorRef;
  hakemusOid: string;
  language: Language;
  label: string;
}) => {
  const { onJonoTulosChange } = useJonoTulosActorRef(jonoTulosActorRef);
  const hakemusJonoTulos = useHakemusJonoTulos(jonoTulosActorRef, hakemusOid);
  const value = hakemusJonoTulos.kuvaus ?? {};

  return (
    <OphInput
      value={value?.[language] ?? ''}
      inputProps={{ 'aria-label': label }}
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

  const { t } = useTranslations();

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
              title: 'valintalaskennan-tulokset.kokonaispisteet',
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
      ...(['fi', 'sv', 'en'] as Array<Language>).map(
        (lang) =>
          ({
            title: `${TRANSLATIONS_PREFIX}.kuvaus-${lang}`,
            key: `kuvaus.${lang}`,
            render: ({ hakemusOid }) => (
              <KuvausInput
                jonoTulosActorRef={jonoTulosActorRef}
                hakemusOid={hakemusOid}
                language={lang}
                label={t(`${TRANSLATIONS_PREFIX}.kuvaus-${lang}`)}
              />
            ),
            sortable: false,
          }) as JonoColumn,
      ),
    ],
    [t, jonoTulosActorRef, selectedJarjestysperuste, haku],
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
