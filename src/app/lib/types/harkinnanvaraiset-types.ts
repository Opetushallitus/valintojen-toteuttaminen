import { HarkinnanvarainenTila } from '../valintalaskenta-service';

export type HarkinnanvarainenTilaValue = HarkinnanvarainenTila | '';

export type HarkinnanvaraisetTilatByHakemusOids = Record<
  string,
  HarkinnanvarainenTilaValue
>;
