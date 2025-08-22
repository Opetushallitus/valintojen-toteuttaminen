import { Jarjestyskriteeri, TuloksenTila } from '@/lib/types/laskenta-types';
import { useEffect, useState } from 'react';
import { JarjestyskriteeriParams } from '../lib/types/jarjestyskriteeri-types';
import { useHasChanged } from '@/hooks/useHasChanged';

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
  jarjestyskriteeri?: Jarjestyskriteeri | JarjestyskriteeriParams,
) => {
  const [muokkausParams, setMuokkausParams] = useState<JarjestyskriteeriParams>(
    () => ({
      tila: jarjestyskriteeri?.tila ?? TuloksenTila.MAARITTELEMATON,
      arvo: jarjestyskriteeri?.arvo?.toString() ?? '',
      selite: getSelite(jarjestyskriteeri),
      prioriteetti: jarjestyskriteeri?.prioriteetti ?? 0,
    }),
  );

  const jarjestyskriteeriChanged = useHasChanged(
    jarjestyskriteeri?.prioriteetti,
  );

  useEffect(() => {
    if (jarjestyskriteeriChanged) {
      setMuokkausParams({
        tila: jarjestyskriteeri?.tila ?? TuloksenTila.MAARITTELEMATON,
        arvo: jarjestyskriteeri?.arvo?.toString() ?? '',
        selite: getSelite(jarjestyskriteeri),
        prioriteetti: jarjestyskriteeri?.prioriteetti ?? 0,
      });
    }
  }, [jarjestyskriteeri, jarjestyskriteeriChanged]);

  return [muokkausParams, setMuokkausParams] as const;
};
