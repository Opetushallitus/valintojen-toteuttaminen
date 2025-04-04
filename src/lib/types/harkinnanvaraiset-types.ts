import { Hakemus } from '../ataru/ataru-types';
import { KoutaOidParams } from '../kouta/kouta-types';

export type HarkinnanvarainenTila = 'HYVAKSYTTY' | 'EI_HYVAKSYTTY' | null;

export type HarkinnanvaraisestiHyvaksytty = KoutaOidParams & {
  hakemusOid: string;
  harkinnanvaraisuusTila: HarkinnanvarainenTila;
};

export type HarkinnanvarainenTilaValue = HarkinnanvarainenTila | '';

export type HarkinnanvaraisetTilatByHakemusOids = Record<
  string,
  HarkinnanvarainenTilaValue
>;

export type HarkinnanvaraisuudenSyy =
  | 'SURE_YKS_MAT_AI'
  | 'SURE_EI_PAATTOTODISTUSTA'
  | 'ATARU_YKS_MAT_AI'
  | 'ATARU_ULKOMAILLA_OPISKELTU'
  | 'ATARU_EI_PAATTOTODISTUSTA'
  | 'ATARU_SOSIAALISET_SYYT'
  | 'ATARU_OPPIMISVAIKEUDET'
  | 'ATARU_KOULUTODISTUSTEN_VERTAILUVAIKEUDET'
  | 'ATARU_RIITTAMATON_TUTKINTOKIELEN_TAITO'
  | 'EI_HARKINNANVARAINEN'
  | 'EI_HARKINNANVARAINEN_HAKUKOHDE';

export type HakemuksenHarkinnanvaraisuus = Hakemus & {
  harkinnanvaraisuudenSyy?: `harkinnanvaraisuuden-syy.${HarkinnanvaraisuudenSyy}`;
  harkinnanvarainenTila: HarkinnanvarainenTila;
};
