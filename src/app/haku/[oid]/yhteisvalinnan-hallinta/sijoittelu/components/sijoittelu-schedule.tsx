import { CalendarComponent } from '@/components/calendar-component';
import { useTranslations } from '@/lib/localization/useTranslations';
import { InfoOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphFormFieldWrapper,
  OphSelect,
} from '@opetushallitus/oph-design-system';
import { useState } from 'react';

export const SijoitteluSchedule = () => {
  const { t } = useTranslations();
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [frequency, setFrequency] = useState<string>('24');
  const [scheduleInUse, setScheduleInUse] = useState<boolean>(false);

  return (
    <Box>
      <Box>
        <Typography variant="h3">
          {t('yhteisvalinnan-hallinta.sijoittelu.ajastus.otsikko')}
        </Typography>
        <Typography
          variant="body1"
          sx={{ display: 'flex', alignItems: 'flex-start', marginTop: 1 }}
        >
          <InfoOutlined htmlColor={ophColors.blue2} />
          {scheduleInUse
            ? t('yhteisvalinnan-hallinta.sijoittelu.ajastus.kaytossa')
            : t('yhteisvalinnan-hallinta.sijoittelu.ajastus.ei-kaytossa')}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: 2,
          marginTop: 2,
          alignItems: 'flex-end',
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
        <OphButton onClick={() => setScheduleInUse(true)} variant="contained">
          {scheduleInUse
            ? t('yhteisvalinnan-hallinta.sijoittelu.ajastus.paivita')
            : t('yhteisvalinnan-hallinta.sijoittelu.ajastus.kayta')}
        </OphButton>
        <OphButton
          onClick={() => setScheduleInUse(false)}
          variant="outlined"
          disabled={!scheduleInUse}
        >
          {t('yhteisvalinnan-hallinta.sijoittelu.ajastus.poista')}
        </OphButton>
      </Box>
    </Box>
  );
};
