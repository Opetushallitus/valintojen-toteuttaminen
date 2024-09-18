'use client';
import { ListTable } from '@/app/components/table/list-table';
import {
  hakijaColumn,
  makeBooleanYesNoColumn,
  makeCountColumn,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { ListTableColumn } from '@/app/components/table/table-types';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakijaryhmanHakija } from '@/app/lib/types/laskenta-types';
import { Box } from '@mui/material';
import { TFunction } from 'i18next';
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
        {props.sijoittelunTila && (
          <>{t(`sijoitteluntila.${props.sijoittelunTila}`)}</>
        )}
        {props.varasijanNumero && <>({props.varasijanNumero})</>}
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
      hakijaColumn,
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
