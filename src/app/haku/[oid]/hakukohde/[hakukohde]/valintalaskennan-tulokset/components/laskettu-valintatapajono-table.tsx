'use client';
import { ListTable } from '@/app/components/table/list-table';
import {
  createHakijaColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { ListTableColumn } from '@/app/components/table/table-types';
import { JonoSijaWithHakijaInfo } from '@/app/hooks/useLasketutValinnanVaiheet';
import { useTranslations } from '@/app/hooks/useTranslations';
import { configuration } from '@/app/lib/configuration';
import { Link } from '@mui/material';
import { useMemo } from 'react';

const TRANSLATIONS_PREFIX = 'valintalaskennan-tulokset.taulukko';

const jonosijaColumn = makeCountColumn<JonoSijaWithHakijaInfo>({
  title: `${TRANSLATIONS_PREFIX}.jonosija`,
  key: 'jonosija',
  amountProp: 'jonosija',
});

const hakutoiveColumn = makeGenericColumn<JonoSijaWithHakijaInfo>({
  title: `${TRANSLATIONS_PREFIX}.hakutoive`,
  key: 'hakutoiveNumero',
  valueProp: 'hakutoiveNumero',
});

export const LaskettuValintatapajonoTable = ({
  jonosijat,
  jonoId,
  setSort,
  sort,
}: {
  jonosijat: Array<JonoSijaWithHakijaInfo>;
  jonoId: string;
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const { t, translateEntity } = useTranslations();

  const columns: Array<ListTableColumn<JonoSijaWithHakijaInfo>> = useMemo(
    () => [
      jonosijaColumn,
      createHakijaColumn('valintalaskennan-tulokset'),
      {
        title: `${TRANSLATIONS_PREFIX}.pisteet`,
        key: 'pisteet',
        render: ({ pisteet, hakemusOid }) => (
          <span>
            {pisteet}{' '}
            <Link
              href={configuration.valintalaskentahistoriaUrl({
                hakemusOid,
                valintatapajonoOid: jonoId,
              })}
            >
              {t('yleinen.lisatietoja')}
            </Link>
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
        title: `${TRANSLATIONS_PREFIX}.muutoksen-syy`,
        key: 'muutoksenSyy',
        render: (props) => <span>{translateEntity(props.muutoksenSyy)}</span>,
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
    />
  );
};
