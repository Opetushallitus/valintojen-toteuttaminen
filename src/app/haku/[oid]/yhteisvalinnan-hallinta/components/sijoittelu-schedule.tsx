import { CalendarComponent } from '@/components/calendar-component';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import useToaster from '@/hooks/useToaster';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  createAjastettuSijoittelu,
  deleteAjastettuSijoittelu,
  getAjastettuSijoittelu,
  updateAjastettuSijoittelu,
} from '@/lib/sijoittelu/sijoittelu-service';
import { AjastettuSijoittelu } from '@/lib/types/sijoittelu-types';
import { Box, Typography } from '@mui/material';
import {
  OphButton,
  OphFormFieldWrapper,
  OphSelect,
} from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { isNullish } from 'remeda';
import { SijoitteluInfo } from './sijoittelu-info';

const ScheduleContent = ({
  hakuOid,
  ajastettuSijoittelu,
}: {
  hakuOid: string;
  ajastettuSijoittelu: AjastettuSijoittelu | null;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    ajastettuSijoittelu?.startTime ?? null,
  );
  const [frequency, setFrequency] = useState<string>(
    ajastettuSijoittelu?.frequency ?? '24',
  );
  const [scheduleInUse, setScheduleInUse] = useState<boolean>(
    ajastettuSijoittelu?.active ?? false,
  );

  const upsertAjastettuSijoittelu = async () => {
    if (isNullish(scheduledDate)) {
      return;
    }
    try {
      if (scheduleInUse) {
        await updateAjastettuSijoittelu(hakuOid, scheduledDate, frequency);
      } else {
        await createAjastettuSijoittelu(hakuOid, scheduledDate, frequency);
      }
      setScheduleInUse(true);
      addToast({
        key: `upsertAjastettuSijoittelu-${hakuOid}`,
        message: scheduleInUse
          ? 'yhteisvalinnan-hallinta.sijoittelu.ajastus.paivitys-ok'
          : 'yhteisvalinnan-hallinta.sijoittelu.ajastus.luonti-ok',
        type: 'success',
      });
    } catch (e) {
      console.error(e);
      addToast({
        key: `upsertAjastettuSijoitteluError-${hakuOid}`,
        message: scheduleInUse
          ? 'yhteisvalinnan-hallinta.sijoittelu.ajastus.paivitys-virhe'
          : 'yhteisvalinnan-hallinta.sijoittelu.ajastus.luonti-virhe',
        type: 'error',
      });
    }
  };

  const removeAjastettuSijoittelu = async () => {
    try {
      await deleteAjastettuSijoittelu(hakuOid);
      setScheduleInUse(false);
      addToast({
        key: `deleteAjastettuSijoittelu-${hakuOid}`,
        message: 'yhteisvalinnan-hallinta.sijoittelu.ajastus.poisto-ok',
        type: 'success',
      });
    } catch (e) {
      console.error(e);
      addToast({
        key: `deleteAjastettuSijoittelu-${hakuOid}`,
        message: 'yhteisvalinnan-hallinta.sijoittelu.ajastus.poisto-virhe',
        type: 'error',
      });
    }
  };

  return (
    <>
      <SijoitteluInfo
        text={
          scheduleInUse
            ? t('yhteisvalinnan-hallinta.sijoittelu.ajastus.kaytossa')
            : t('yhteisvalinnan-hallinta.sijoittelu.ajastus.ei-kaytossa')
        }
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: 2,
          marginTop: 2,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <CalendarComponent
          setDate={setScheduledDate}
          selectedValue={scheduledDate}
          label={t(
            'yhteisvalinnan-hallinta.sijoittelu.ajastus.aloitusajankohta',
          )}
        />
        <OphFormFieldWrapper
          label={t('yhteisvalinnan-hallinta.sijoittelu.ajastus.ajotiheys')}
          renderInput={() => (
            <OphSelect
              inputProps={{
                'aria-label': t(
                  'yhteisvalinnan-hallinta.sijoittelu.ajastus.valitse-ajotiheys',
                ),
              }}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              sx={{ width: '120px' }}
              options={[
                {
                  value: '6',
                  label: t(
                    'yhteisvalinnan-hallinta.sijoittelu.ajastus.ajotiheys-tuntia',
                    { amount: 6 },
                  ),
                },
                {
                  value: '12',
                  label: t(
                    'yhteisvalinnan-hallinta.sijoittelu.ajastus.ajotiheys-tuntia',
                    { amount: 12 },
                  ),
                },
                {
                  value: '24',
                  label: t(
                    'yhteisvalinnan-hallinta.sijoittelu.ajastus.ajotiheys-tuntia',
                    { amount: 24 },
                  ),
                },
              ]}
            />
          )}
        />
        <OphButton
          onClick={upsertAjastettuSijoittelu}
          variant="contained"
          disabled={isNullish(frequency) || isNullish(scheduledDate)}
        >
          {scheduleInUse
            ? t('yhteisvalinnan-hallinta.sijoittelu.ajastus.paivita')
            : t('yhteisvalinnan-hallinta.sijoittelu.ajastus.kayta')}
        </OphButton>
        <OphButton
          onClick={removeAjastettuSijoittelu}
          variant="outlined"
          disabled={!scheduleInUse}
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.ajastus.poista')}
        </OphButton>
      </Box>
    </>
  );
};

export const SijoitteluSchedule = ({ hakuOid }: { hakuOid: string }) => {
  const { t } = useTranslations();

  const { data: ajastettuSijoittelu } = useSuspenseQuery({
    queryKey: ['ajastettu-sijoittelu', hakuOid],
    queryFn: () => getAjastettuSijoittelu(hakuOid),
  });

  return (
    <Box>
      <Typography variant="h3">
        {t('yhteisvalinnan-hallinta.sijoittelu.ajastus.otsikko')}
      </Typography>
      <QuerySuspenseBoundary>
        <ScheduleContent
          hakuOid={hakuOid}
          ajastettuSijoittelu={ajastettuSijoittelu}
        />
      </QuerySuspenseBoundary>
    </Box>
  );
};
