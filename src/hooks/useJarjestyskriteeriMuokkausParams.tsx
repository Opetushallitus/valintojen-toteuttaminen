import { useMemo } from 'react';
import { JarjestyskriteeriParams } from '../lib/types/jarjestyskriteeri-types';
import { MuokattuJonosijaContext } from '@/lib/state/muokattuJonosijaMachineTypes';
import { EditableJarjestyskriteeriTulos } from './useEditableValintalaskennanTulokset';
import { TuloksenTila } from '@/lib/types/laskenta-types';

const isJarjestyskriteeriTulos = (
  x: unknown,
): x is EditableJarjestyskriteeriTulos => {
  return (x as EditableJarjestyskriteeriTulos)?.kuvaus !== undefined;
};

const getSelite = (
  jarjestyskriteeri?: EditableJarjestyskriteeriTulos | JarjestyskriteeriParams,
) => {
  return isJarjestyskriteeriTulos(jarjestyskriteeri)
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
