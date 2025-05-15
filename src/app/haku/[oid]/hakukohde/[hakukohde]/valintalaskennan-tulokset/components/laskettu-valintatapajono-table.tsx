'use client';
import { EditButton } from '@/components/edit-button';
import { showModal } from '@/components/modals/global-modal';
import {
  ListTable,
  ListTablePaginationProps,
} from '@/components/table/list-table';
import {
  createHakijaColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/components/table/table-columns';
import { ListTableColumn } from '@/components/table/table-types';
import { ValintalaskentaEditGlobalModal } from '@/components/modals/valintalaskenta-edit-global-modal';
import {
  LaskennanJonosijaTulosWithHakijaInfo,
  LaskennanValintatapajonoTulos,
} from '@/hooks/useEditableValintalaskennanTulokset';
import { useTranslations } from '@/lib/localization/useTranslations';
import { getHenkiloTitle } from '@/lib/henkilo-utils';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { TuloksenTila } from '@/lib/types/laskenta-types';
import { OphLink } from '@opetushallitus/oph-design-system';
import { useMemo } from 'react';
import { refetchLaskennanTulokset } from '../lib/refetchLaskennanTulokset';
import { useQueryClient } from '@tanstack/react-query';
import { useConfiguration } from '@/hooks/useConfiguration';

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
  setSort: (newSort: string) => void;
  pagination: ListTablePaginationProps;
}) => {
  const { t, translateEntity } = useTranslations();

  const { configuration, getConfigUrl } = useConfiguration();

  const queryClient = useQueryClient();

  const columns: Array<ListTableColumn<LaskennanJonosijaTulosWithHakijaInfo>> =
    useMemo(
      () => [
        jonosijaColumn,
        createHakijaColumn({}),
        {
          title: `${TRANSLATIONS_PREFIX}.pisteet`,
          key: 'pisteet',
          render: ({ pisteet, hakemusOid }) => (
            <span>
              {pisteet}{' '}
              {configuration && (
                <OphLink
                  iconVisible={false}
                  href={getConfigUrl(
                    configuration.routes.valintalaskentahistoriaLinkUrl,
                    {
                      hakemusOid,
                      valintatapajonoOid: jono.oid,
                    },
                  )}
                >
                  {t('yleinen.lisatietoja')}
                </OphLink>
              )}
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
                    showModal(ValintalaskentaEditGlobalModal, {
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
      [
        t,
        jono,
        translateEntity,
        hakukohde,
        queryClient,
        configuration,
        getConfigUrl,
      ],
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
