import {
  Jarjestyskriteeri,
  TuloksenTila,
} from '@/app/lib/types/laskenta-types';
import { useEffect, useState } from 'react';
import { JarjestyskriteeriParams } from '../lib/types/jarjestyskriteeri-types';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { useMutation } from '@tanstack/react-query';
import {
  deleteJonosijanJarjestyskriteeri,
  saveJonosijanJarjestyskriteeri,
} from '@/app/lib/valintalaskenta/valintalaskenta-service';

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
      ...params
    }: JarjestyskriteeriParams & { mode: MutationMode }) => {
      if (mode === 'delete') {
        await deleteJonosijanJarjestyskriteeri({
          valintatapajonoOid,
          hakemusOid,
          jarjestyskriteeriPrioriteetti,
        });
      } else {
        await saveJonosijanJarjestyskriteeri({
          valintatapajonoOid,
          hakemusOid,
          jarjestyskriteeriPrioriteetti,
          ...params,
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

const useMuokkausParams = (jarjestyskriteeri?: Jarjestyskriteeri) => {
  const [muokkausParams, setMuokkausParams] = useState<JarjestyskriteeriParams>(
    () => ({
      tila: jarjestyskriteeri?.tila ?? TuloksenTila.MAARITTELEMATON,
      arvo: jarjestyskriteeri?.arvo?.toString() ?? '',
      selite: jarjestyskriteeri?.kuvaus?.FI ?? '',
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
        selite: jarjestyskriteeri?.kuvaus?.FI ?? '',
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
    saveJarjestyskriteeri: () => mutate({ ...muokkausParams, mode: 'save' }),
    deleteJarjestyskriteeri: () =>
      mutate({ ...muokkausParams, mode: 'delete' }),
    muokkausParams,
    setMuokkausParams,
  };
};
