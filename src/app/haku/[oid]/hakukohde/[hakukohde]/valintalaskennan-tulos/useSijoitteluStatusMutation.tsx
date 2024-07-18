import {
  LaskettuValinnanVaihe,
  LaskettuValintatapajono,
  muutaSijoittelunStatus,
} from '@/app/lib/valintalaskenta-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSijoitteluStatusMutation = (hakukohdeOid: string) => {
  const queryClient = useQueryClient();

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
      // TODO: Toast-notifikaatio (OK-585)
      window.alert('Jonon sijoittelun statuksen muuttamisesa tapahtui virhe!');
      console.error(e);
    },
  });
};
