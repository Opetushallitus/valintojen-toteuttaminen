import { Jarjestyskriteeri, TuloksenTila } from '@/lib/types/laskenta-types';
import { useEffect, useState } from 'react';
import { JarjestyskriteeriParams } from '../lib/types/jarjestyskriteeri-types';
import { useHasChanged } from '@/hooks/useHasChanged';
import { useMutation } from '@tanstack/react-query';
import {
  deleteJonosijanJarjestyskriteeri,
  saveJonosijanJarjestyskriteerit,
} from '@/lib/valintalaskenta/valintalaskenta-service';

type MutationMode = 'save' | 'delete';

const useJarjestyskriteeriMutation = ({
  hakemusOid,
  valintatapajonoOid,
  jarjestyskriteeriPrioriteetti,
  onSuccess,
  onError,
}: {
  hakemusOid: string;
  valintatapajonoOid: string;
  jarjestyskriteeriPrioriteetti: number;
  onSuccess: (mode: MutationMode) => void;
  onError: (e: Error, mode: MutationMode) => void;
}) => {
  return useMutation({
    mutationFn: async ({
      mode,
      params,
    }: {
      params: Array<JarjestyskriteeriParams>;
      mode: MutationMode;
    }) => {
      if (mode === 'delete') {
        await deleteJonosijanJarjestyskriteeri({
          valintatapajonoOid,
          hakemusOid,
          jarjestyskriteeriPrioriteetti,
        });
      } else {
        await saveJonosijanJarjestyskriteerit({
          valintatapajonoOid,
          hakemusOid,
          kriteerit: params,
        });
      }
    },
    onError: (e, { mode }) => {
      onError(e, mode);
    },
    onSuccess: (_, { mode }) => {
      onSuccess(mode);
    },
  });
};

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

export const useJarjestyskriteeriState = ({
  hakemusOid,
  valintatapajonoOid,
  jarjestyskriteeri,
  onError,
  onSuccess,
}: {
  hakemusOid: string;
  valintatapajonoOid: string;
  jarjestyskriteeri?: Jarjestyskriteeri;
  onError: (e: Error, mode: MutationMode) => void;
  onSuccess: (mode: MutationMode) => void;
}) => {
  const [muokkausParams, setMuokkausParams] =
    useMuokkausParams(jarjestyskriteeri);

  const { mutate, isPending } = useJarjestyskriteeriMutation({
    hakemusOid,
    valintatapajonoOid,
    jarjestyskriteeriPrioriteetti: jarjestyskriteeri?.prioriteetti ?? 0,
    onError,
    onSuccess,
  });

  return {
    isPending,
    saveJarjestyskriteeri: () =>
      mutate({ params: [muokkausParams], mode: 'save' }),
    deleteJarjestyskriteeri: () =>
      mutate({ params: [muokkausParams], mode: 'delete' }),
    muokkausParams,
    setMuokkausParams,
  };
};
