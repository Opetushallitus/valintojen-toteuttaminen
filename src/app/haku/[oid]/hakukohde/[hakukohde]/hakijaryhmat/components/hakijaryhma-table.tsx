'use client';
import { ListTable } from '@/components/table/list-table';
import {
  createHakijaColumn,
  makeBooleanYesNoColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/components/table/table-columns';
import { ListTableColumn } from '@/components/table/table-types';
import { TFunction, useTranslations } from '@/lib/localization/useTranslations';
import { getReadableHakemuksenTila } from '@/lib/sijoittelun-tulokset-utils';
import { HakijaryhmanHakija } from '@/lib/types/laskenta-types';
import { Box } from '@mui/material';
import { useMemo } from 'react';

const TRANSLATIONS_PREFIX = 'hakijaryhmat.taulukko';

const makeSijoittelunTilaColumn = (
  t: TFunction,
): ListTableColumn<HakijaryhmanHakija> => ({
  title: `${TRANSLATIONS_PREFIX}.sijoittelun-tila`,
  key: 'sijoittelunTila',
  render: (props) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 1,
      }}
    >
      {props.jononNimi && (
        <span>
          {t(`${TRANSLATIONS_PREFIX}.valintatapajono`)}: {props.jononNimi}
        </span>
      )}
      <span>
        {props.sijoittelunTila
          ? getReadableHakemuksenTila(
              {
                tila: props.sijoittelunTila,
                varasijanNumero: props.varasijanNumero,
                hyvaksyttyHarkinnanvaraisesti: false,
              },
              t,
            )
          : null}
      </span>
    </Box>
  ),
  style: { width: 'auto' },
});

export const HakijaryhmaTable = ({
  hakijat,
  sort,
  setSort,
}: {
  hakijat: Array<HakijaryhmanHakija>;
  sort: string;
  setSort: (sort: string) => void;
}) => {
  const { t } = useTranslations();

  const columns: Array<ListTableColumn<HakijaryhmanHakija>> = useMemo(
    () => [
      createHakijaColumn({}),
      makeBooleanYesNoColumn<HakijaryhmanHakija>({
        t,
        title: `${TRANSLATIONS_PREFIX}.kuuluminen`,
        key: 'kuuluuHakijaryhmaan',
        booleanValueProp: 'kuuluuHakijaryhmaan',
      }),
      makeSijoittelunTilaColumn(t),
      makeBooleanYesNoColumn<HakijaryhmanHakija>({
        t,
        title: `${TRANSLATIONS_PREFIX}.hyvaksytty`,
        key: 'hyvaksyttyHakijaryhmasta',
        booleanValueProp: 'hyvaksyttyHakijaryhmasta',
      }),
      makeCountColumn<HakijaryhmanHakija>({
        title: `${TRANSLATIONS_PREFIX}.pisteet`,
        key: 'pisteet',
        amountProp: 'pisteet',
      }),
      makeGenericColumn<HakijaryhmanHakija>({
        title: `${TRANSLATIONS_PREFIX}.vastaanottotila`,
        key: 'vastaanottoTila',
        valueProp: 'vastaanottoTila',
      }),
    ],
    [t],
  );

  return (
    <ListTable
      rowKeyProp="hakemusOid"
      columns={columns}
      rows={hakijat}
      sort={sort}
      setSort={setSort}
    />
  );
};
