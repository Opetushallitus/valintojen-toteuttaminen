'use client';
import { EditButton } from '@/app/components/edit-button';
import { showModal } from '@/app/components/global-modal';
import {
  ListTable,
  ListTablePaginationProps,
} from '@/app/components/table/list-table';
import {
  createHakijaColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { ListTableColumn } from '@/app/components/table/table-types';
import { ValintalaskentaEditModal } from '@/app/components/valintalaskenta-edit-modal';
import {
  LaskennanJonosijaTulosWithHakijaInfo,
  LaskennanValintatapajonoTulos,
} from '@/app/hooks/useEditableValintalaskennanTulokset';
import { useTranslations } from '@/app/hooks/useTranslations';
import { configuration } from '@/app/lib/configuration';
import { getHenkiloTitle } from '@/app/lib/henkilo-utils';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { TuloksenTila } from '@/app/lib/types/laskenta-types';
import { OphLink } from '@opetushallitus/oph-design-system';
import { useMemo } from 'react';
import { refetchLaskennanTulokset } from '../lib/refetchLaskennanTulokset';
import { useQueryClient } from '@tanstack/react-query';

const TRANSLATIONS_PREFIX = 'valintalaskennan-tulokset.taulukko';

const jonosijaColumn = makeCountColumn<LaskennanJonosijaTulosWithHakijaInfo>({
  title: `${TRANSLATIONS_PREFIX}.jonosija`,
  key: 'jonosija',
  amountProp: 'jonosija',
});

const hakutoiveColumn = makeGenericColumn<LaskennanJonosijaTulosWithHakijaInfo>(
  {
    title: `${TRANSLATIONS_PREFIX}.hakutoive`,
    key: 'hakutoiveNumero',
    valueProp: 'hakutoiveNumero',
  },
);

export const LaskettuValintatapajonoTable = ({
  hakukohde,
  jono,
  rows,
  setSort,
  sort,
  pagination,
}: {
  hakukohde: Hakukohde;
  rows: Array<LaskennanJonosijaTulosWithHakijaInfo>;
  jono: LaskennanValintatapajonoTulos;
  sort: string;
  setSort: (sort: string) => void;
  pagination: ListTablePaginationProps;
}) => {
  const { t, translateEntity } = useTranslations();

  const queryClient = useQueryClient();

  const columns: Array<ListTableColumn<LaskennanJonosijaTulosWithHakijaInfo>> =
    useMemo(
      () => [
        jonosijaColumn,
        createHakijaColumn(),
        {
          title: `${TRANSLATIONS_PREFIX}.pisteet`,
          key: 'pisteet',
          render: ({ pisteet, hakemusOid }) => (
            <span>
              {pisteet}{' '}
              <OphLink
                iconVisible={false}
                href={configuration.valintalaskentahistoriaUrl({
                  hakemusOid,
                  valintatapajonoOid: jono.oid,
                })}
              >
                {t('yleinen.lisatietoja')}
              </OphLink>
            </span>
          ),
        },
        hakutoiveColumn,
        {
          title: `${TRANSLATIONS_PREFIX}.valintatieto`,
          key: 'tuloksenTila',
          render: (props) => (
            <div>{t('tuloksenTila.' + props.tuloksenTila)}</div>
          ),
        },
        {
          title: `${TRANSLATIONS_PREFIX}.kuvaus`,
          key: 'kuvaus',
          render: (props) => <span>{translateEntity(props.kuvaus)}</span>,
        },
        {
          title: `${TRANSLATIONS_PREFIX}.toiminnot`,
          key: 'muokkaa',
          render: (props) => {
            return (
              props.tuloksenTila !==
                TuloksenTila.HYVAKSYTTY_HARKINNANVARAISESTI && (
                <EditButton
                  onClick={() => {
                    showModal(ValintalaskentaEditModal, {
                      hakutoiveNumero: props.hakutoiveNumero,
                      hakijanNimi: getHenkiloTitle(props),
                      hakukohde: hakukohde,
                      valintatapajono: jono,
                      jonosija: props,
                      onSuccess: () => {
                        refetchLaskennanTulokset({
                          hakukohdeOid: hakukohde.oid,
                          queryClient,
                        });
                      },
                    });
                  }}
                />
              )
            );
          },
          sortable: false,
        },
      ],
      [t, jono, translateEntity, hakukohde, queryClient],
    );

  return (
    <ListTable
      rowKeyProp="hakijaOid"
      columns={columns}
      rows={rows}
      sort={sort}
      setSort={setSort}
      pagination={pagination}
    />
  );
};
