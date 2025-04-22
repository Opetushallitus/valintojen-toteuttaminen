import { useTranslations } from '@/lib/localization/useTranslations';
import { Haku } from '@/lib/kouta/kouta-types';
import { LetterCounts } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';
import { ListTable } from '@/components/table/list-table';
import {
  LetterStats,
  mapLetterCountsToLetterStats,
  translateLetter,
} from '../lib/letter-options';
import { useEffect, useState } from 'react';
import {
  makeColumnWithCustomRender,
  makeCountColumn,
  makeExternalLinkColumn,
} from '@/components/table/table-columns';
import { LettersPublishCell } from './letters-publish-cell';

//TODO: handle null in column and in here
const buildLinkToLetters = (letterBatchId: string) =>
  `viestintapalvelu-ui/#/reportLetters/${letterBatchId}`;

export const LettersTable = ({
  haku,
  letterCounts,
  refetchLetterCounts,
}: {
  haku: Haku;
  letterCounts: Array<LetterCounts>;
  refetchLetterCounts: () => void;
}) => {
  const { t } = useTranslations();

  const [letterStats, setLetterStats] = useState<Array<LetterStats>>([]);

  useEffect(() => {
    setLetterStats(mapLetterCountsToLetterStats(letterCounts));
  }, [letterCounts]);

  const columns = [
    makeColumnWithCustomRender<LetterStats>({
      title: 'yhteisvalinnan-hallinta.kirjeet.kirjeen-nimi',
      key: 'id',
      renderFn: (props: LetterStats) => translateLetter(props.letter, t, true),
    }),
    makeExternalLinkColumn<LetterStats>({
      linkBuilder: buildLinkToLetters,
      title: 'yhteisvalinnan-hallinta.kirjeet.lahetyksen-tunniste',
      key: 'letterBatchId',
      linkProp: 'letterBatchId',
    }),
    makeCountColumn<LetterStats>({
      key: 'id',
      title: 'yhteisvalinnan-hallinta.kirjeet.virheellisia',
      amountProp: 'letterErrorCount',
    }),
    makeCountColumn<LetterStats>({
      key: 'id',
      title: 'yhteisvalinnan-hallinta.kirjeet.kesken',
      amountProp: 'letterProgressCount',
    }),
    makeCountColumn<LetterStats>({
      key: 'id',
      title: 'yhteisvalinnan-hallinta.kirjeet.valmiit',
      amountProp: 'letterReadyCount',
    }),
    makeColumnWithCustomRender<LetterStats>({
      key: 'id',
      title: 'yhteisvalinnan-hallinta.kirjeet.julkaistut',
      renderFn: (props) => (
        <LettersPublishCell
          haku={haku}
          letterStats={props}
          refetchLetterCounts={refetchLetterCounts}
        />
      ),
    }),
  ];

  return <ListTable rowKeyProp="id" columns={columns} rows={letterStats} />;
};
