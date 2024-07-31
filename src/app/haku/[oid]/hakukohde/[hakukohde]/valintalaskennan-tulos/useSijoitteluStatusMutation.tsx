import useToaster from '@/app/hooks/useToaster';
import {
  LaskettuValinnanVaihe,
  LaskettuValintatapajono,
} from '@/app/lib/laskenta-types';
import { muutaSijoittelunStatus } from '@/app/lib/valintalaskenta-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSijoitteluStatusMutation = (hakukohdeOid: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: async ({
      jono,
      status,
    }: {
      jono: LaskettuValintatapajono;
      status: boolean;
    }) => {
      await muutaSijoittelunStatus({ jono, status });
      queryClient.setQueryData(
        ['getLasketutValinnanVaiheet', hakukohdeOid],
        (vaiheet: Array<LaskettuValinnanVaihe>) =>
          vaiheet.map((vaihe) => ({
            ...vaihe,
            valintatapajonot: vaihe.valintatapajonot?.map((oldJono) => ({
              ...oldJono,
              valmisSijoiteltavaksi:
                jono.oid === oldJono.oid
                  ? status
                  : oldJono.valmisSijoiteltavaksi,
            })),
          })),
      );
    },
    onError: (e) => {
      addToast({
        key: 'jono-sijoittelu-status-change',
        message: 'valintalaskennan-tulos.virhe-sijoittelu-muutos',
        type: 'error',
      });
      console.error(e);
    },
  });
};
