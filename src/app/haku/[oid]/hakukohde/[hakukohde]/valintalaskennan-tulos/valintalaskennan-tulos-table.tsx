'use client';
import ListTable, {
  makeExternalLinkColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { configuration } from '@/app/lib/configuration';
import { JonoSijaWithHakijaInfo } from '@/app/lib/valintalaskenta-service';
import { Link } from '@mui/material';
import { useMemo } from 'react';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

const jonosijaColumn = makeCountColumn<JonoSijaWithHakijaInfo>({
  title: 'jonosija',
  key: 'hakemus',
  amountProp: 'jonosija',
});

const hakijaColumn = makeExternalLinkColumn<JonoSijaWithHakijaInfo>({
  linkBuilder: buildLinkToPerson,
  title: 'hakeneet.taulukko.hakija',
  key: 'hakemus.hakija',
  nameProp: 'hakijanNimi',
  linkProp: 'henkiloOid',
});

const hakutoiveColumn = makeGenericColumn<JonoSijaWithHakijaInfo>({
  title: 'hakutoive',
  key: 'hakutoiveNumero',
  valueProp: 'hakutoiveNumero',
});

export const ValintalaskennanTulosTable = ({
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
  const { t } = useTranslations();

  const columns = useMemo(
    () => [
      jonosijaColumn,
      hakijaColumn,
      {
        title: 'pisteet',
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
    ],
    [t, jonoId],
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
