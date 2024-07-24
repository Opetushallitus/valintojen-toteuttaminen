'use client';
import ListTable, {
  makeExternalLinkColumn,
  ListTableColumn,
  makeBooleanYesNoColumn,
} from '@/app/components/table/list-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import { HakijaryhmanHakija } from '@/app/lib/valintalaskenta-service';
import { useMemo } from 'react';

const TRANSLATIONS_PREFIX = 'hakijaryhmat.taulukko';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

const buildLinkToPerson = (personOid: string) => LINK_TO_PERSON + personOid;

/*
"hakija": "Hakija",
"kuuluminen": "Hakijaryhmään kuuluminen",
"sijoittelun-tila": "Sijoittelun tila",
"hyvaksytty": "Hyväksytty hakijaryhmästä",
"pisteet": "Pisteet",
"vastaanottotila": "Vastaanottotila"*/

const hakijaColumn = makeExternalLinkColumn<HakijaryhmanHakija>({
  linkBuilder: buildLinkToPerson,
  title: `${TRANSLATIONS_PREFIX}.hakija`,
  key: 'hakijanNimi',
  nameProp: 'hakijanNimi',
  linkProp: 'henkiloOid',
});

export const HakijaryhmaTable = ({
  hakijat,
}: {
  hakijat: Array<HakijaryhmanHakija>;
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
      makeBooleanYesNoColumn<HakijaryhmanHakija>({
        t,
        title: `${TRANSLATIONS_PREFIX}.hyvaksytty`,
        key: 'hyvaksyttyHakijaryhmasta',
        booleanValueProp: 'hyvaksyttyHakijaryhmasta',
      }),
    ],
    [t],
  );

  return <ListTable rowKeyProp="hakemusOid" columns={columns} rows={hakijat} />;
};
