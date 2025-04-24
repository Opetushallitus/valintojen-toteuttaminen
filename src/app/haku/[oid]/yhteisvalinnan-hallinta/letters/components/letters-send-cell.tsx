import { useTranslations } from '@/lib/localization/useTranslations';
import { Haku } from '@/lib/kouta/kouta-types';
import { LetterStats, translateLetter } from '../lib/letter-options';
import { useState } from 'react';
import { Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { sendLetters } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import useToaster from '@/hooks/useToaster';
import { isNullish } from 'remeda';
import { ExternalLink } from '@/components/external-link';

export const LettersSendCell = ({
  haku,
  letterStats,
  refetchLetterCounts,
}: {
  haku: Haku;
  letterStats: LetterStats;
  refetchLetterCounts: () => void;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const [askingConfirmation, setAskingConfirmation] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    setAskingConfirmation(false);
    setSending(true);
    try {
      if (isNullish(letterStats.letterBatchId)) {
        throw 'No letterBatchId provided';
      }
      await sendLetters(
        haku.oid,
        letterStats.letter.letterType,
        letterStats.letter.lang,
        letterStats.letterBatchId,
      );
      addToast({
        key: `lahetetty-kirjeet-${haku.oid}-${letterStats.letter.id}`,
        message: `${translateLetter(letterStats.letter, t, true)} ${t('yhteisvalinnan-hallinta.kirjeet.lahetetty')}`,
        type: 'success',
      });
      refetchLetterCounts();
    } catch (error) {
      console.error(error);
      addToast({
        key: `lahetetty-kirjeet-${haku.oid}-${letterStats.letter.id}-virhe`,
        message: `${translateLetter(letterStats.letter, t, true)} ${t('yhteisvalinnan-hallinta.kirjeet.lahetyksessa-virhe')}`,
        type: 'error',
      });
    }
    setSending(false);
  };

  return (
    <>
      <ConfirmationModal
        title={t('yhteisvalinnan-hallinta.kirjeet.vahvista-lahetys')}
        open={askingConfirmation}
        onConfirm={send}
        onCancel={() => setAskingConfirmation(false)}
      >
        <Typography>
          {`${t('yhteisvalinnan-hallinta.kirjeet.lahettamassa')} ${translateLetter(letterStats.letter, t, true).toLowerCase()}.`}
        </Typography>
      </ConfirmationModal>
      {!isNullish(letterStats.groupEmailId) && (
        <ExternalLink
          noIcon={true}
          name={'' + letterStats.groupEmailId}
          href={`viestintapalvelu-ui/#/reportMessages/view/${letterStats.groupEmailId}`}
        />
      )}
      {isNullish(letterStats.groupEmailId) && (
        <OphButton
          onClick={() => setAskingConfirmation(true)}
          variant="contained"
          loading={sending}
          disabled={
            !letterStats.readyForEPosti || isNullish(letterStats.letterBatchId)
          }
        >
          {t('yhteisvalinnan-hallinta.kirjeet.laheta')}
        </OphButton>
      )}
    </>
  );
};
