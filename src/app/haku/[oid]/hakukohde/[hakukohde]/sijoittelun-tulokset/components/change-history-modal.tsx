import { useTranslations } from '@/app/hooks/useTranslations';
import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { Box, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useMemo, useState } from 'react';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { HakemusChangeEvent } from '@/app/lib/types/valinta-tulos-types';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import {
  makeColumnWithCustomRender,
  makeGenericColumn,
} from '@/app/components/table/table-columns';
import { ListTable } from '@/app/components/table/list-table';
import { getSortParts } from '@/app/components/table/table-utils';

const HistoryModalContent = ({
  changeHistory,
  sort,
  setSort,
}: {
  changeHistory: HakemusChangeEvent[];
  sort: string;
  setSort: (s: string) => void;
}) => {
  const { t } = useTranslations();

  const parseMuutos = (muutos: string | boolean) => {
    if (typeof muutos === 'boolean') {
      if (!muutos) {
        return t('yleinen.ei');
      }
      return t('yleinen.kylla');
    }
    return t(`sijoittelun-tulokset.muutoshistoria.muutokset.${muutos}`, {
      defaultValue: muutos,
    });
  };

  const parseKey = (key: string) =>
    t(`sijoittelun-tulokset.muutoshistoria.muutokset.${key}`, {
      defaultValue: key,
    });

  const columns = [
    makeGenericColumn<HakemusChangeEvent>({
      title: 'sijoittelun-tulokset.muutoshistoria.ajankohta',
      key: 'changeTime',
      valueProp: 'changeTime',
    }),
    makeColumnWithCustomRender<HakemusChangeEvent>({
      title: 'sijoittelun-tulokset.muutoshistoria.muutos',
      key: 'changes',
      renderFn: (props) =>
        props.changes.map((c, index) => (
          <Box key={`change-detail-${index}`}>
            {parseKey(c.field)}: {parseMuutos(c.to)}
          </Box>
        )),
      sortable: false,
    }),
  ];
  return (
    <ListTable
      rowKeyProp="rowKey"
      columns={columns}
      rows={changeHistory}
      sort={sort}
      setSort={setSort}
    />
  );
};

export const ChangeHistoryModal = createModal(
  ({
    changeHistory,
    hakemus,
  }: {
    changeHistory: HakemusChangeEvent[];
    hakemus: SijoittelunHakemusValintatiedoilla;
  }) => {
    const modalProps = useOphModalProps();
    const { t } = useTranslations();

    const [sort, setSort] = useState<string>('changeTime:desc');

    const sortedHistory = useMemo(() => {
      const { direction } = getSortParts(sort);
      return changeHistory.sort((a, b) => {
        const aTime = new Date(a.changeTimeUnformatted).getTime();
        const bTime = new Date(b.changeTimeUnformatted).getTime();
        if (direction === 'asc') {
          return aTime - bTime;
        }
        return bTime - aTime;
      });
    }, [sort, changeHistory]);

    return (
      <OphModalDialog
        {...modalProps}
        title={t('sijoittelun-tulokset.muutoshistoria.otsikko')}
        maxWidth="md"
        actions={
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
          {hakemus.hakijanNimi}
        </Typography>
        <HistoryModalContent
          changeHistory={sortedHistory}
          sort={sort}
          setSort={setSort}
        />
      </OphModalDialog>
    );
  },
);
