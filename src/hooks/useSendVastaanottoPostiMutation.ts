import {
  sendVastaanottopostiHakemukselle,
  sendVastaanottopostiHakukohteelle,
  sendVastaanottopostiValintatapaJonolle,
} from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { useMutation } from '@tanstack/react-query';
import useToaster from './useToaster';

export const useSendVastaanottoPostiMutation = ({
  target,
  hakukohdeOid,
  valintatapajonoOid,
  hakemusOid,
}: {
  target: 'hakukohde' | 'valintatapajono' | 'hakemus';
  hakukohdeOid?: string;
  valintatapajonoOid?: string;
  hakemusOid?: string;
}) => {
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: () => {
      switch (true) {
        case target === 'hakemus':
          if (!hakemusOid) {
            throw new Error('HakemusOid is required for hakemus target');
          }
          return sendVastaanottopostiHakemukselle(hakemusOid);
        case target === 'valintatapajono':
          if (!valintatapajonoOid || !hakukohdeOid) {
            throw new Error(
              'HakukohdeOid or ValintatapajonoOid is required for valintatapajono target',
            );
          }
          return sendVastaanottopostiValintatapaJonolle(
            hakukohdeOid,
            valintatapajonoOid,
          );
        case target === 'hakukohde':
          if (!hakukohdeOid) {
            throw new Error('HakukohdeOid is required for hakukohde target');
          }
          return sendVastaanottopostiHakukohteelle(hakukohdeOid);
        default:
          throw new Error('Invalid target type');
      }
    },
    onError: (e) => {
      addToast({
        key: `send-vastaanottoposti-${target}-error`,
        message: `vastaanottoposti.${target}-virhe`,
        type: 'error',
      });
      console.error(e);
    },
    onSuccess: (data) => {
      if (!data || data.length === 0) {
        addToast({
          key: `send-vastaanottoposti-${target}-empty`,
          message: `vastaanottoposti.${target}-ei-lahetettavia`,
          type: 'error',
        });
      } else {
        addToast({
          key: `send-vastaanottoposti-${target}-success`,
          message: `vastaanottoposti.${target}-lahetetty`,
          type: 'success',
        });
      }
    },
  });
};
