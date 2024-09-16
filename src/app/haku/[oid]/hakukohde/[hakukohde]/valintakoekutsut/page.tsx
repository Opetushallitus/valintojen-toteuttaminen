'use client';

import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { TabContainer } from '../tab-container';
import { ClientSpinner } from '@/app/components/client-spinner';
import { ValintatapajonoAccordion } from '../valintalaskennan-tulos/valintatapajono-accordion';
import * as R from 'remeda';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useValintakoekutsut } from '@/app/hooks/useValintakoekutsut';
import { ValintakoekutsutTable } from './valintakoekutsut-table';

type ValintakoekutsutContentProps = {
  hakuOid: string;
  hakukohdeOid: string;
};

const DEFAULT_NUQS_OPTIONS = {
  history: 'push',
  clearOnDefault: true,
} as const;

const ryhmittelyParser = parseAsStringLiteral([
  'kokeittain',
  'hakijoittain',
]).withDefault('kokeittain');

const parseRyhmittely = (ryhmittelyStr: string) =>
  ryhmittelyParser.parse(ryhmittelyStr);

function ValintakoekutsutContent({
  hakuOid,
  hakukohdeOid,
}: ValintakoekutsutContentProps) {
  const [ryhmittely, setRyhmittely] = useQueryState(
    'ryhmittely',
    ryhmittelyParser.withOptions(DEFAULT_NUQS_OPTIONS),
  );

  const [vainKutsuttavat, setVainKutsuttavat] = useQueryState(
    'vain-kutsuttavat',
    parseAsBoolean.withDefault(true).withOptions(DEFAULT_NUQS_OPTIONS),
  );

  const valintakoekutsut = useValintakoekutsut({
    hakuOid,
    hakukohdeOid,
    ryhmittely,
    vainKutsuttavat: vainKutsuttavat,
  });

  const { t } = useTranslations();

  const handleRyhmittelyChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRyhmittely: string,
  ) => {
    setRyhmittely(parseRyhmittely(newRyhmittely));
  };

  const handleVainKutsuttavatChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setVainKutsuttavat(event.target.checked);
  };

  return (
    <Box>
      <Box>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            {t('valintakoekutsut.nayta')}
          </FormLabel>
          <FormGroup row>
            <ToggleButtonGroup
              color="primary"
              value={ryhmittely}
              onChange={handleRyhmittelyChange}
              exclusive
            >
              <ToggleButton value="kokeittain">
                {t('valintakoekutsut.kokeittain')}
              </ToggleButton>
              <ToggleButton value="hakijoittain">
                {t('valintakoekutsut.hakijoittain')}
              </ToggleButton>
            </ToggleButtonGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={vainKutsuttavat}
                  onChange={handleVainKutsuttavatChange}
                />
              }
              label={t('valintakoekutsut.vain-kutsuttavat')}
            />
          </FormGroup>
        </FormControl>
      </Box>
      {ryhmittely === 'hakijoittain'
        ? 'TODO: Hakijoittain ryhmittely'
        : R.pipe(
            R.entries(valintakoekutsut),
            R.map(([valintakoeTunniste, valintakokeenKutsut]) => (
              <ValintatapajonoAccordion
                key={valintakoeTunniste}
                id="valintakoekutsu"
                title={valintakoeTunniste}
              >
                <ValintakoekutsutTable
                  valintakokeenKutsut={valintakokeenKutsut}
                />
              </ValintatapajonoAccordion>
            )),
          )}
    </Box>
  );
}

export default function ValintakoekutsutPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
        <ValintakoekutsutContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
