import { Jarjestyskriteeri, TuloksenTila } from '@/lib/types/laskenta-types';
import { useMemo } from 'react';
import { JarjestyskriteeriParams } from '../lib/types/jarjestyskriteeri-types';
import { MuokattuJonosijaContext } from '@/lib/state/muokattuJonosijaMachineTypes';

const isJarjestyskriteeri = (x: unknown): x is Jarjestyskriteeri => {
  return (x as Jarjestyskriteeri).kuvaus !== undefined;
};

const getSelite = (
  jarjestyskriteeri?: Jarjestyskriteeri | JarjestyskriteeriParams,
) => {
  return isJarjestyskriteeri(jarjestyskriteeri)
    ? (jarjestyskriteeri?.kuvaus?.FI ?? '')
    : (jarjestyskriteeri?.selite ?? '');
};

export const useMuokkausParams = (
  context: MuokattuJonosijaContext,
  jarjestyskriteeriPrioriteetti: number,
) => {
  return useMemo(() => {
    const jarjestyskriteeri =
      context.changedKriteerit.find(
        (k) => k.prioriteetti === jarjestyskriteeriPrioriteetti,
      ) ?? context.jonosija.jarjestyskriteerit?.[jarjestyskriteeriPrioriteetti];
    return {
      tila: jarjestyskriteeri?.tila ?? TuloksenTila.MAARITTELEMATON,
      arvo: jarjestyskriteeri?.arvo?.toString() ?? '',
      selite: getSelite(jarjestyskriteeri),
      prioriteetti: jarjestyskriteeri?.prioriteetti ?? 0,
    };
  }, [jarjestyskriteeriPrioriteetti, context]);
};
