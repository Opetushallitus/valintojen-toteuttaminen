import useToaster from '@/hooks/useToaster';
import {
  hakukohteenValintalaskennanTuloksetQueryOptions,
  muutaSijoittelunStatus,
  MuutaSijoittelunStatusProps,
} from '@/lib/valintalaskenta/valintalaskenta-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSijoitteluStatusMutation = (hakukohdeOid: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async ({
      jono,
      jonoSijoitellaan,
    }: MuutaSijoittelunStatusProps) => {
      await muutaSijoittelunStatus({ jono, jonoSijoitellaan });
      queryClient.setQueryData(
        hakukohteenValintalaskennanTuloksetQueryOptions(hakukohdeOid).queryKey,
        (vaiheet) =>
          vaiheet?.map((vaihe) => ({
            ...vaihe,
            valintatapajonot: vaihe.valintatapajonot?.map((oldJono) => ({
              ...oldJono,
              valmisSijoiteltavaksi:
                jono.oid === oldJono.oid
                  ? jonoSijoitellaan
                  : oldJono.valmisSijoiteltavaksi,
            })),
          })),
      );
    },
    onError: (e) => {
      addToast({
        key: 'jono-sijoittelu-status-change',
        message: 'valintalaskennan-tulokset.virhe-sijoittelu-muutos',
        type: 'error',
      });
      console.error(e);
    },
  });
};
