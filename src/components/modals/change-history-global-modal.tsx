import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useMemo, useState } from 'react';
import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import {
  HakemusChangeDetail,
  HakemusChangeEvent,
} from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { OphModal } from '@/components/modals/oph-modal';
import {
  makeColumnWithCustomRender,
  makeGenericColumn,
} from '@/components/table/table-columns';
import { ListTable } from '@/components/table/list-table';
import { getSortParts } from '@/components/table/table-utils';
import { isEmpty, sortBy } from 'remeda';
import { QuerySuspenseBoundary } from '../query-suspense-boundary';
import { FullClientSpinner } from '../client-spinner';
import { useSuspenseQuery } from '@tanstack/react-query';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import { isTimestamp } from '@/lib/time-utils';
import { ErrorAlert } from '../error-alert';
import { queryOptionsGetChangeHistoryForHakemus } from '@/lib/valinta-tulos-service/valinta-tulos-queries';

export const HistoryEvent = ({
  changes,
}: {
  changes: Array<HakemusChangeDetail>;
}) => {
  const { t } = useTranslations();
  const parseMuutos = (muutos: string | boolean) => {
    if (typeof muutos === 'boolean') {
      return !muutos ? t('yleinen.ei') : t('yleinen.kylla');
    } else if (isTimestamp(muutos)) {
      return toFormattedDateTimeString(muutos);
    } else if (isEmpty(muutos)) {
      return '';
    }

    return t(`sijoittelun-tulokset.muutoshistoria.muutokset.${muutos}`, {
      defaultValue: muutos,
    });
  };

  const parseKey = (key: string) => {
    if (key.includes(' ')) {
      return key;
    }

    return t(`sijoittelun-tulokset.muutoshistoria.muutokset.${key}`, {
      defaultValue: key,
    });
  };

  return changes.map((c, index) => (
    <Box key={`change-detail-${index}`}>
      {parseKey(c.field)}: {parseMuutos(c.to)}
    </Box>
  ));
};

const HistoryModalContent = ({
  hakemusOid,
  valintatapajonoOid,
}: {
  hakemusOid: string;
  valintatapajonoOid: string;
}) => {
  const { data: history } = useSuspenseQuery(
    queryOptionsGetChangeHistoryForHakemus({ hakemusOid, valintatapajonoOid }),
  );

  const [sort, setSort] = useState<string>('changeTime:desc');

  const changeHistory = useMemo(() => {
    const { direction } = getSortParts(sort);
    return sortBy(history, [
      (event) => new Date(event.changeTimeUnformatted).getTime(),
      direction ?? 'desc',
    ]);
  }, [sort, history]);

  const columns = [
    makeGenericColumn<HakemusChangeEvent>({
      title: 'sijoittelun-tulokset.muutoshistoria.ajankohta',
      key: 'changeTime',
      valueProp: 'changeTime',
    }),
    makeColumnWithCustomRender<HakemusChangeEvent>({
      title: 'sijoittelun-tulokset.muutoshistoria.muutos',
      key: 'changes',
      renderFn: (props) => <HistoryEvent changes={props.changes} />,
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

export const ChangeHistoryGlobalModal = createModal(
  ({
    hakemus,
  }: {
    hakemus: {
      hakemusOid: string;
      hakijanNimi: string;
      valintatapajonoOid?: string;
    };
  }) => {
    const modalProps = useOphModalProps();
    const { t } = useTranslations();

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
        {hakemus.valintatapajonoOid && (
          <QuerySuspenseBoundary
            suspenseFallback={<FullClientSpinner />}
            errorFallbackRender={({ resetErrorBoundary }) => (
              <ErrorAlert
                title={t('sijoittelun-tulokset.toiminnot.muutoshistoria-virhe')}
                retry={resetErrorBoundary}
              />
            )}
          >
            <HistoryModalContent
              hakemusOid={hakemus.hakemusOid}
              valintatapajonoOid={hakemus.valintatapajonoOid}
            />
          </QuerySuspenseBoundary>
        )}
      </OphModal>
    );
  },
);
