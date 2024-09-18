import { ValintakoeOsallistuminen } from './valintakoekutsut-types';

export type HakutoiveValintakoeOsallistumiset = {
  hakuOid: string;
  hakemusOid: string;
  hakijaOid: string;
  createdAt: string;
  hakutoiveet: Array<{
    hakukohdeOid: string;
    valinnanVaiheet: Array<{
      valinnanVaiheOid: string;
      valinnanVaiheJarjestysluku: number;
      valintakokeet: Array<{
        valintakoeOid: string;
        valintakoeTunniste: string;
        nimi: string;
        aktiivinen: boolean;
        lahetetaankoKoekutsut: boolean;
        kutsutaankoKaikki: boolean | null;
        osallistuminenTulos: {
          osallistuminen: ValintakoeOsallistuminen;
          kuvaus: {
            FI?: string;
            SV?: string;
            EN?: string;
          };
        };
      }>;
    }>;
  }>;
};
