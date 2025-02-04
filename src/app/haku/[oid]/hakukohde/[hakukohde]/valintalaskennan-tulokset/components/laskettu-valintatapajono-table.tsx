'use client';
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
import { LaskennanJonosijaTulosWithHakijaInfo } from '@/app/hooks/useEditableValintalaskennanTulokset';
import { useTranslations } from '@/app/hooks/useTranslations';
import { configuration } from '@/app/lib/configuration';
import { OphLink } from '@opetushallitus/oph-design-system';
import { useMemo } from 'react';

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
  jonosijat,
  jonoId,
  setSort,
  sort,
  pagination,
}: {
  jonosijat: Array<LaskennanJonosijaTulosWithHakijaInfo>;
  jonoId: string;
  sort: string;
  setSort: (sort: string) => void;
  pagination: ListTablePaginationProps;
}) => {
  const { t, translateEntity } = useTranslations();

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
                  valintatapajonoOid: jonoId,
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
            <span>{t('tuloksenTila.' + props.tuloksenTila)}</span>
          ),
        },
        {
          title: `${TRANSLATIONS_PREFIX}.kuvaus`,
          key: 'kuvaus',
          render: (props) => <span>{translateEntity(props.kuvaus)}</span>,
        },
      ],
      [t, jonoId, translateEntity],
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
