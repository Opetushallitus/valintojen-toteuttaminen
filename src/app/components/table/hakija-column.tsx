import { makeExternalLinkColumn } from './list-table';

const LINK_TO_PERSON = 'henkilo-ui/oppija/';

export const buildLinkToPerson = (personOid: string) =>
  LINK_TO_PERSON + personOid;

type HakijaColumnType = {
  hakijanNimi: string;
  hakijaOid: string;
};

export const hakijaColumn = makeExternalLinkColumn<HakijaColumnType>({
  linkBuilder: buildLinkToPerson,
  title: 'hakeneet.taulukko.hakija',
  key: 'hakijanNimi',
  nameProp: 'hakijanNimi',
  linkProp: 'hakijaOid',
});
