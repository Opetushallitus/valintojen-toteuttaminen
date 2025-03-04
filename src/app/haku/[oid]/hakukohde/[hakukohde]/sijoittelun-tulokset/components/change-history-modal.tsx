import { useTranslations } from '@/lib/localization/useTranslations';
import { SijoittelunHakemusValintatiedoilla } from '@/lib/types/sijoittelu-types';
import { Box, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useMemo, useState } from 'react';
import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { HakemusChangeEvent } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { OphModal } from '@/components/modals/oph-modal';
import {
  makeColumnWithCustomRender,
  makeGenericColumn,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { getSortParts } from '@/components/table/table-utils';
import { sortBy } from 'remeda';

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
      return !muutos ? t('yleinen.ei') : t('yleinen.kylla');
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
      return sortBy(changeHistory, [
        (event) => new Date(event.changeTimeUnformatted).getTime(),
        direction || 'desc',
      ]);
    }, [sort, changeHistory]);

    return (
      <OphModal
        {...modalProps}
        title={t('sijoittelun-tulokset.muutoshistoria.otsikko')}
        maxWidth="md"
        actions={
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {hakemus.hakijanNimi}
        </Typography>
        <HistoryModalContent
          changeHistory={sortedHistory}
          sort={sort}
          setSort={setSort}
        />
      </OphModal>
    );
  },
);
