import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/lib/types/laskenta-types';
import { updatePisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback, useMemo } from 'react';
import { clone, indexBy, isNonNullish, isNumber, prop } from 'remeda';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { commaToPoint, FetchError } from '@/lib/common';
import { Toast } from '@/hooks/useToaster';
import {
  isKoeValuesEqual,
  PistesyottoAnyEvent,
  PistesyottoChangedPistetietoEvent,
  PistesyottoChangeParams,
  PisteSyottoEvent,
  PisteSyottoStates,
} from '@/lib/state/pistesyotto-state-common';

export type HakukohdePisteSyottoContext = {
  pistetiedot: Array<HakemuksenPistetiedot>;
  changedPistetiedot: Array<HakemuksenPistetiedot>;
  kokeetByTunniste: Record<string, ValintakoeAvaimet>;
  error?: Error | FetchError | null;
};

export type HakukohdePistesyottoActorRef = ActorRefFrom<
  ReturnType<typeof createHakukohdePisteSyottoMachine>
>;

const pistetietoChangeReducer = ({
  context,
  event,
}: {
  context: HakukohdePisteSyottoContext;
  event: PistesyottoChangedPistetietoEvent;
}) => {
  const changedPistetieto = context.changedPistetiedot.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );
  const existingPistetieto = context.pistetiedot.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );

  const existingKoe = existingPistetieto?.valintakokeenPisteet?.find(
    (k) => k.tunniste === event.koeTunniste,
  );

  const pistetieto = clone(existingPistetieto);

  const koe = clone(
    changedPistetieto?.valintakokeenPisteet?.find(
      (k) => k.tunniste === event.koeTunniste,
    ) ?? existingKoe,
  );

  if (pistetieto && koe) {
    const newArvo = event.arvo;
    if (
      newArvo &&
      koe.osallistuminen === ValintakoeOsallistuminenTulos.MERKITSEMATTA
    ) {
      koe.osallistuminen = ValintakoeOsallistuminenTulos.OSALLISTUI;
    } else {
      koe.osallistuminen = event.osallistuminen ?? koe.osallistuminen;
    }

    if (
      event.osallistuminen &&
      event.osallistuminen !== ValintakoeOsallistuminenTulos.OSALLISTUI
    ) {
      koe.arvo = '';
    } else {
      koe.arvo = newArvo ?? koe.arvo;
    }

    if (changedPistetieto) {
      const newPisteet = clone(changedPistetieto.valintakokeenPisteet).map(
        (p) => (p.tunniste === event.koeTunniste ? koe : p),
      );

      // pistetiedolla ei enää muokattuja kokeen pisteitä, voidaan poistaa
      if (
        !newPisteet.some(
          (p) =>
            !isKoeValuesEqual(
              p,
              existingPistetieto?.valintakokeenPisteet?.find(
                (vp) => vp.tunniste === p.tunniste,
              ),
            ),
        )
      ) {
        return context.changedPistetiedot.filter(
          (p) => p.hakemusOid !== event.hakemusOid,
        );
      }

      // pistetiedolla edelleen muokattuja kokeen pisteitä. Vaihdetaan muokattuun pistetietoon.
      pistetieto.valintakokeenPisteet = newPisteet;

      return context.changedPistetiedot.map((h) =>
        h.hakemusOid === event.hakemusOid ? pistetieto : h,
      );
    } else {
      pistetieto.valintakokeenPisteet = pistetieto.valintakokeenPisteet.map(
        (p) => (p.tunniste === koe.tunniste ? koe : p),
      );
      return [...context.changedPistetiedot, pistetieto];
    }
  }
  return context.changedPistetiedot;
};

export const createHakukohdePisteSyottoMachine = (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: Array<HakemuksenPistetiedot>,
  valintakokeet: Array<ValintakoeAvaimet>,
  onEvent: (event: Toast) => void,
  lastModified?: string,
) => {
  const kokeetByTunniste = indexBy(valintakokeet, prop('tunniste'));
  return createMachine({
    id: `PistesyottoMachine-${hakukohdeOid}-${lastModified}`,
    initial: PisteSyottoStates.IDLE,
    context: {
      pistetiedot,
      changedPistetiedot: [],
      kokeetByTunniste,
    },
    types: {} as {
      context: HakukohdePisteSyottoContext;
      events: PistesyottoAnyEvent;
      actions:
        | { type: 'alert' }
        | { type: 'warn'; params: { message: string } }
        | { type: 'successNotify' };
    },
    states: {
      [PisteSyottoStates.IDLE]: {
        on: {
          [PisteSyottoEvent.PISTETIETO_CHANGED]: {
            actions: assign({
              changedPistetiedot: pistetietoChangeReducer,
            }),
          },
          [PisteSyottoEvent.UPDATE]: [
            {
              guard: 'hasUnchangedPistetiedot',
              target: PisteSyottoStates.IDLE,
              actions: {
                type: 'warn',
                params: { message: 'virhe.eimuutoksia' },
              },
            },
            {
              guard: 'hasInvalidPisteet',
              target: PisteSyottoStates.IDLE,
              actions: {
                type: 'warn',
                params: { message: 'virhe.tarkistasyote' },
              },
            },
            {
              target: PisteSyottoStates.UPDATING,
            },
          ],
        },
      },
      [PisteSyottoStates.UPDATING]: {
        invoke: {
          src: 'updatePistetiedot',
          input: ({ context }) => context.changedPistetiedot,
          onDone: {
            target: PisteSyottoStates.UPDATE_COMPLETED,
          },
          onError: {
            target: PisteSyottoStates.ERROR,
            actions: assign({
              error: ({ event }) => event.error as Error,
            }),
          },
        },
      },
      [PisteSyottoStates.ERROR]: {
        always: [
          {
            target: PisteSyottoStates.IDLE,
            actions: {
              type: 'alert',
            },
          },
        ],
      },
      [PisteSyottoStates.UPDATE_COMPLETED]: {
        always: [
          {
            target: PisteSyottoStates.IDLE,
            actions: 'successNotify',
          },
        ],
        entry: [
          assign({
            changedPistetiedot: [],
          }),
        ],
      },
    },
  }).provide({
    guards: {
      hasUnchangedPistetiedot: ({ context }) =>
        context.changedPistetiedot.length === 0,
      hasInvalidPisteet: ({ context }) =>
        isNonNullish(
          context.changedPistetiedot
            .flatMap((pt) => pt.valintakokeenPisteet)
            .find((p) => {
              const arvo = commaToPoint(p.arvo);
              const matchingKoe = context.kokeetByTunniste[p.tunniste];
              const maxVal =
                isNonNullish(matchingKoe?.max) &&
                Number.parseFloat(matchingKoe.max);
              const minVal =
                isNonNullish(matchingKoe?.min) &&
                Number.parseFloat(matchingKoe.min);
              const invalid: boolean =
                (isNumber(minVal) &&
                  (isNaN(Number(arvo)) || (minVal as number) > Number(arvo))) ||
                (isNumber(maxVal) &&
                  (isNaN(Number(arvo)) || (maxVal as number) < Number(arvo)));
              return invalid;
            }),
        ),
    },
    actions: {
      alert: ({ context }) => {
        const conflictError =
          context.error instanceof FetchError &&
          context.error.response.status === 412;
        const message = conflictError
          ? 'pistesyotto.virhe-tallennus-konflikti'
          : 'virhe.tallennus';
        let messageParams = {};
        if (conflictError && context.error instanceof FetchError) {
          const errorsJ = JSON.parse(context.error.message) as Array<{
            applicationOID: string;
            applicantName: string;
          }>;
          const errors = errorsJ.map(
            (em) => `- ${em.applicationOID} (${em.applicantName})\n`,
          );
          messageParams = { applications: errors };
        }
        return onEvent({
          key: `pistetiedot-update-failed-for-${hakukohdeOid}`,
          message,
          messageParams,
          type: 'error',
          manualCloseOnly: conflictError,
        });
      },
      warn: (_, params) =>
        onEvent({
          key: `pistetiedot-update-failed-for-${hakukohdeOid}`,
          message: params.message,
          type: 'error',
        }),
      successNotify: () =>
        onEvent({
          key: `pistetiedot-updated-for-${hakukohdeOid}`,
          message: 'pistesyotto.valmis',
          type: 'success',
        }),
    },
    actors: {
      updatePistetiedot: fromPromise(
        ({ input }: { input: Array<HakemuksenPistetiedot> }) => {
          return updatePisteetForHakukohde(
            hakuOid,
            hakukohdeOid,
            input,
            lastModified,
          );
        },
      ),
    },
  });
};

type HakukohdePistesyottoMachineParams = KoutaOidParams & {
  pistetiedot: Array<HakemuksenPistetiedot>;
  valintakokeet: Array<ValintakoeAvaimet>;
  onEvent: (event: Toast) => void;
  lastModified?: string;
};

export const usePistesyottoState = ({
  hakuOid,
  hakukohdeOid,
  pistetiedot,
  valintakokeet,
  onEvent,
  lastModified,
}: HakukohdePistesyottoMachineParams) => {
  const machine = useMemo(
    () =>
      createHakukohdePisteSyottoMachine(
        hakuOid,
        hakukohdeOid,
        pistetiedot,
        valintakokeet,
        onEvent,
        lastModified,
      ),
    [hakuOid, hakukohdeOid, pistetiedot, valintakokeet, onEvent, lastModified],
  );
  const actorRef = useActorRef(machine);

  return usePistesyottoActorRef(actorRef);
};

export const usePistesyottoActorRef = (
  actorRef: HakukohdePistesyottoActorRef,
) => {
  const snapshot = useSelector(actorRef, (s) => s);
  const isDirty = useIsDirty(actorRef);

  const onKoeChange = useCallback(
    (params: PistesyottoChangeParams) => {
      actorRef.send({
        type: PisteSyottoEvent.PISTETIETO_CHANGED,
        ...params,
      });
    },
    [actorRef],
  );

  const savePistetiedot = useCallback(() => {
    actorRef.send({ type: PisteSyottoEvent.UPDATE });
  }, [actorRef]);

  return {
    actorRef,
    snapshot,
    isUpdating: snapshot.matches(PisteSyottoStates.UPDATING),
    onKoeChange,
    savePistetiedot,
    isDirty,
  };
};

export const useKoePistetiedot = (
  pistesyottoActor: HakukohdePistesyottoActorRef,
  { hakemusOid, koeTunniste }: { hakemusOid: string; koeTunniste: string },
) => {
  return useSelector(pistesyottoActor, (s) => {
    let koe = s.context.changedPistetiedot
      .find((p: { hakemusOid: string }) => p.hakemusOid === hakemusOid)
      ?.valintakokeenPisteet.find(
        (p: { tunniste: string }) => p.tunniste === koeTunniste,
      );

    if (!koe) {
      koe = s.context.pistetiedot
        .find((p: { hakemusOid: string }) => p.hakemusOid === hakemusOid)
        ?.valintakokeenPisteet.find(
          (p: { tunniste: string }) => p.tunniste === koeTunniste,
        );
    }
    return {
      arvo: koe?.arvo ?? '',
      osallistuminen: koe?.osallistuminen,
    };
  });
};

export const useIsDirty = (pistesyottoActorRef: HakukohdePistesyottoActorRef) =>
  useSelector(
    pistesyottoActorRef,
    (s) => s.context.changedPistetiedot.length !== 0,
  );
