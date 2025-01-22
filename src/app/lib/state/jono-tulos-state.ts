import {
  LaskettuValinnanVaiheModel,
  TuloksenTila,
} from '@/app/lib/types/laskenta-types';
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import { ActorRefFrom, assign, createMachine, fromPromise } from 'xstate';
import { TranslatedName } from '../localization/localization-types';
import {
  JonoSija,
  LaskettuJono,
  LaskettuValinnanvaiheInfo,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { GenericEvent, isEmpty } from '@/app/lib/common';
import {
  constant,
  filter,
  fromEntries,
  isNonNullish,
  map,
  mapKeys,
  pipe,
  values,
  when,
} from 'remeda';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { saveValinnanvaiheTulokset } from '../valintalaskenta-service';

type JonoTulosByHakemusOid = Record<string, JonoSija>;

export type JonoTulosContext = {
  jonoTulokset: JonoTulosByHakemusOid;
  changedJonoTulokset: JonoTulosByHakemusOid;
  jarjestysPeruste: JarjestysPeruste;
  valinnanvaihe: LaskettuValinnanvaiheInfo;
  valintatapajono: LaskettuJono;
  onEvent: (toast: GenericEvent) => void;
  hakukohde: HakukohdeJonoTulosProps;
};

export enum JonoTulosState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  ERROR = 'ERROR',
}

export enum JonoTulosEventType {
  UPDATE = 'UPDATE',
  JONOTULOS_CHANGED = 'JONOTULOS_CHANGED',
  JARJESTYSPERUSTE_CHANGED = 'JARJESTYSPERUSTE_CHANGED',
  RESET = 'RESET',
}

type JonoTulosAnyEvent =
  | JonoTulosUpdateEvent
  | JonoTulosChangeEvent
  | JarjestysperusteChangeEvent
  | JonoTulosResetEvent;

export type JonoTulosUpdateEvent = {
  type: JonoTulosEventType.UPDATE;
};

type JonoTulosContextInput = {
  hakukohde: HakukohdeJonoTulosProps;
  valinnanvaihe: LaskettuValinnanvaiheInfo;
  valintatapajono: LaskettuJono;
  onEvent: (toast: GenericEvent) => void;
};

export type JonoTulosResetEvent = {
  type: JonoTulosEventType.RESET;
  input: JonoTulosContextInput;
};

export type JonoTulosChangeParams = {
  hakemusOid: string;
  tuloksenTila?: TuloksenTila;
  jonosija?: string;
  pisteet?: string;
  kuvaus?: TranslatedName;
};

export type JonoTulosChangeEvent = {
  type: JonoTulosEventType.JONOTULOS_CHANGED;
} & JonoTulosChangeParams;

export type JarjestysPeruste = 'jonosija' | 'kokonaispisteet';

export type JarjestysperusteChangeEvent = {
  type: JonoTulosEventType.JARJESTYSPERUSTE_CHANGED;
  jarjestysPeruste: JarjestysPeruste;
};

export type JonoTulosActorRef = ActorRefFrom<typeof jonoTulosMachine>;

const jonoTulosChangeReducer = ({
  context,
  event,
}: {
  context: JonoTulosContext;
  event: JonoTulosChangeEvent;
}) => {
  const { hakemusOid } = event;

  const existingHakemusJonoTulos =
    context.changedJonoTulokset[hakemusOid] ?? context.jonoTulokset[hakemusOid];

  let newTuloksenTila =
    event.tuloksenTila ?? existingHakemusJonoTulos.tuloksenTila;

  if (
    (event.pisteet !== existingHakemusJonoTulos.pisteet ||
      event.jonosija !== existingHakemusJonoTulos.jonosija) &&
    existingHakemusJonoTulos.tuloksenTila === TuloksenTila.MAARITTELEMATON
  ) {
    newTuloksenTila = TuloksenTila.HYVAKSYTTAVISSA;
  }

  let newJonosija = event.jonosija ?? existingHakemusJonoTulos.jonosija ?? '';
  let newPisteet = event.pisteet ?? existingHakemusJonoTulos.pisteet ?? '';

  if (newTuloksenTila === TuloksenTila.HYLATTY) {
    newJonosija = '';
    newPisteet = '';
  }

  context.changedJonoTulokset[hakemusOid] = {
    hakemusOid,
    hakijaOid: existingHakemusJonoTulos.hakijaOid,
    tuloksenTila: newTuloksenTila,
    jonosija: newJonosija,
    pisteet: newPisteet,
    muutoksenSyy: event.kuvaus ?? existingHakemusJonoTulos.muutoksenSyy ?? {},
  };

  return context.changedJonoTulokset;
};

const resetContext = (input: JonoTulosContextInput) => {
  return {
    onEvent: input.onEvent,
    hakukohde: input.hakukohde,
    valintatapajono: input.valintatapajono,
    valinnanvaihe: input.valinnanvaihe,
    jonoTulokset: pipe(
      input.valintatapajono.jonosijat,
      map((tulos) => [tulos.hakemusOid, tulos] as const),
      ($) => fromEntries($),
    ),
    changedJonoTulokset: {},
    jarjestysPeruste: input.valintatapajono.kaytetaanKokonaispisteita
      ? 'kokonaispisteet'
      : ('jonosija' as JarjestysPeruste),
  };
};

export const jonoTulosMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkARAGQFEBiAKQHkA5JgFQFUqmBlAfQDCACQCCLAOI0KAbQAMAXUSgADgHtYuAC641+ZSAAeiAEwB2OSQAsAVjlyTATgCMADgBszz64A0IAJ6mjlYkzlburo4AzNE2LlEmAL6JfmhYeISklLR0nAAKFKLsNPJKSCDqmjp6BsYIds7WJnY2Vq5eUWbOfoEIJu6OJAORrq0JzmZWyakYOATE5NT0+YXFMs5lqhrauvrldeaNzs0O4RaOFz2m9iRyjhGuCY72Nq9R0yBpc5kkK0VkkjoED0YBIBAAbmoANagr4ZBZ-dgAiQICFqTDoar4UqlAyVHY1faIZxydw2W5RZxRMkOczualXPo2MwkMzudnRUavGzuMwfOHzUiI5F0MAAJzFajFJBUABtMQAzKWoEgCn7CySo-CQjFYnGKPHbLG1RCedwkEyUqJ3KJRDzRRyM9pDMx2UlmS2jRzmfmzeGkGgAJUDTEDdFx5XxxqJCC8gzMrldzh5cbJVisjOp5ImTnTrRJdr5KU+fsFvwKRRoQiYAFk8rRihRwwbI0bdibY84vCRHA0EnIojYuxNM2YWRczMF3FZnhc5F5ksX8GoIHADGriIaqu2YwBadyM3fki4n09n97FjdZJZbgl7UB1BIhMYJqzOb0JzqZ6Khe7PWztGOciJr66RlhqEi3tGD6IK4JiuKExw2HBZh2i4HqMpaJgkNSg5kgMQ5kjYoHfAsQYhoGUE7jBCBWCYo4som74OPSbjvlYRYzGB6oVsU1Z1g20hUYSNHHAmFruP06ZkmEhGZm+PYmG4jijG+rTSYuiRAA */
  id: 'JonoTulosMachine',
  initial: JonoTulosState.IDLE,
  context: ({ input }: { input: JonoTulosContextInput }) => {
    return resetContext(input);
  },
  types: {} as {
    context: JonoTulosContext;
    events: JonoTulosAnyEvent;
    actions:
      | { type: 'alert'; params: { message: string } }
      | { type: 'successNotify' };
  },
  states: {
    [JonoTulosState.IDLE]: {
      on: {
        [JonoTulosEventType.JONOTULOS_CHANGED]: {
          actions: assign({
            changedJonoTulokset: jonoTulosChangeReducer,
          }),
        },
        [JonoTulosEventType.RESET]: {
          actions: assign(({ event }) => {
            return resetContext(event.input);
          }),
        },
        [JonoTulosEventType.JARJESTYSPERUSTE_CHANGED]: {
          actions: assign({
            jarjestysPeruste: ({ event }) => event.jarjestysPeruste,
            changedJonoTulokset: ({ context }) => {
              return pipe(
                values(context.jonoTulokset),
                filter((jonoTulos) => !isEmpty(jonoTulos.jarjestyskriteerit)),
                map((jonoTulos) => {
                  return [
                    jonoTulos.hakemusOid,
                    {
                      ...jonoTulos,
                      pisteet: undefined,
                      jonosija: undefined,
                      tuloksenTila: TuloksenTila.MAARITTELEMATON,
                    },
                  ] as const;
                }),
                ($) => fromEntries($),
              );
            },
          }),
        },
        [JonoTulosEventType.UPDATE]: [
          {
            guard: 'hasChangedJonoTulokset',
            target: JonoTulosState.UPDATING,
          },
          {
            target: JonoTulosState.IDLE,
            actions: {
              type: 'alert',
              params: { message: 'virhe.eimuutoksia' },
            },
          },
        ],
      },
    },
    [JonoTulosState.UPDATING]: {
      invoke: {
        src: 'updateJonoTulos',
        input: ({ context }) => {
          const vv: LaskettuValinnanVaiheModel = {
            ...context.valinnanvaihe,
            hakuOid: context.hakukohde.hakuOid,
          };

          const { jonoTulokset, changedJonoTulokset, valintatapajono } =
            context;

          const kaytetaanKokonaispisteita =
            context.jarjestysPeruste === 'kokonaispisteet';

          vv.valintatapajonot = [
            {
              ...valintatapajono,
              oid: valintatapajono.oid,
              valintatapajonooid: valintatapajono.valintatapajonooid,
              nimi: valintatapajono.nimi,
              prioriteetti: valintatapajono.prioriteetti,
              valmisSijoiteltavaksi: valintatapajono.valmisSijoiteltavaksi,
              siirretaanSijoitteluun: valintatapajono.siirretaanSijoitteluun,
              kaytetaanKokonaispisteita,
              jonosijat: values(jonoTulokset)
                .filter((jonoTulos) => {
                  return (
                    // Löytyy uusi muutos (käyttöliittymästä) hakemuksen tuloksiin
                    changedJonoTulokset[jonoTulos.hakemusOid] ||
                    // Löytyy vanha (aiemmin ladattu) muutos hakemuksen laskennan tuloksiin
                    isNonNullish(jonoTulos.tuloksenTila)
                  );
                })
                .map((jonoTulos) => {
                  const jarjestyskriteerit = jonoTulos.jarjestyskriteerit ?? [];

                  const changedJonoTulos =
                    changedJonoTulokset[jonoTulos.hakemusOid];

                  const tuloksenTila =
                    changedJonoTulos?.tuloksenTila ??
                    jonoTulos.tuloksenTila ??
                    TuloksenTila.MAARITTELEMATON;

                  if (changedJonoTulos) {
                    if (isEmpty(jarjestyskriteerit)) {
                      jarjestyskriteerit.push({
                        kuvaus: {},
                        arvo: 0,
                        tila: TuloksenTila.MAARITTELEMATON,
                        prioriteetti: 0,
                        nimi: '',
                      });
                    }
                    const numberArvo = Number(
                      kaytetaanKokonaispisteita
                        ? changedJonoTulos?.pisteet
                        : changedJonoTulos.jonosija,
                    );

                    if (isNaN(numberArvo)) {
                      jarjestyskriteerit[0].arvo = 0;
                    } else {
                      if (kaytetaanKokonaispisteita) {
                        jarjestyskriteerit[0].arvo = numberArvo;
                      } else {
                        // Ei käytetä kokonaispisteitä vaan jonosijoja, jotka tallennetaan negatiivisina arvoina
                        jarjestyskriteerit[0].arvo = -numberArvo;
                      }
                    }

                    const kuvaus =
                      changedJonoTulos?.muutoksenSyy ??
                      jonoTulos.muutoksenSyy ??
                      {};

                    jarjestyskriteerit[0].tila = tuloksenTila;
                    jarjestyskriteerit[0].kuvaus = mapKeys(kuvaus, (key) =>
                      key.toUpperCase(),
                    );
                  }

                  const jonosijaNumber = when(
                    Number(jonoTulos.jonosija),
                    isNaN,
                    constant(0),
                  );

                  return {
                    hakemusOid: jonoTulos.hakemusOid,
                    hakijaOid: jonoTulos.hakijaOid,
                    jonosija: jonosijaNumber,
                    tuloksenTila,
                    prioriteetti: 0, // TODO
                    jarjestyskriteerit,
                    harkinnanvarainen: Boolean(jonoTulos.harkinnanvarainen),
                  };
                }),
            },
          ];
          return { valinnanvaihe: vv, hakukohde: context.hakukohde };
        },
        onDone: {
          target: JonoTulosState.UPDATE_COMPLETED,
        },
        onError: {
          target: JonoTulosState.ERROR,
        },
      },
    },
    [JonoTulosState.ERROR]: {
      always: [
        {
          target: JonoTulosState.IDLE,
          actions: {
            type: 'alert',
            params: { message: 'virhe.tallennus' },
          },
        },
      ],
    },
    [JonoTulosState.UPDATE_COMPLETED]: {
      always: [
        {
          target: JonoTulosState.IDLE,
          actions: 'successNotify',
        },
      ],
      entry: [
        assign({
          jonoTulokset: ({ context }) => {
            // TODO: Yhdistä muuttuneet jonotulokset alkuperäisiin jonotuloksiin ja tyhjennä muuttuneet
            return context.jonoTulokset;
          },
        }),
      ],
    },
  },
}).provide({
  guards: {
    hasChangedJonoTulokset: ({ context }) =>
      !isEmpty(context.changedJonoTulokset),
  },
  actions: {
    alert: ({ context }, params) =>
      context.onEvent({
        key: `jonotulos-update-failed-for-${context.hakukohde.oid}`,
        message: (params as { message: string }).message,
        type: 'error',
      }),
    successNotify: ({ context }) =>
      context.onEvent({
        key: `jonotulos-updated-for-${context.hakukohde.oid}`,
        message: 'valintalaskennan-tulokset.jonotulos-valmis',
        type: 'success',
      }),
  },
  actors: {
    updateJonoTulos: fromPromise(
      ({
        input,
      }: {
        input: {
          valinnanvaihe: LaskettuValinnanVaiheModel;
          hakukohde: HakukohdeJonoTulosProps;
        };
      }) => {
        return saveValinnanvaiheTulokset({
          hakukohde: input.hakukohde,
          valinnanvaihe: input.valinnanvaihe,
        });
      },
    ),
  },
});

type JonoTulosMachineParams = {
  hakukohde: HakukohdeJonoTulosProps;
  valinnanvaihe: LaskettuValinnanvaiheInfo;
  laskettuJono: LaskettuJono;
  onEvent: (toast: GenericEvent) => void;
};

type HakukohdeJonoTulosProps = Pick<
  Hakukohde,
  'oid' | 'tarjoajaOid' | 'hakuOid'
>;

export const useJonotulosState = ({
  valinnanvaihe,
  hakukohde,
  laskettuJono,
  onEvent,
}: JonoTulosMachineParams) => {
  const actorRef = useActorRef(jonoTulosMachine, {
    input: {
      hakukohde,
      valinnanvaihe,
      valintatapajono: laskettuJono,
      onEvent,
    },
  });

  const onEventCb = useCallback(onEvent, [onEvent]);

  // Resetoidaan konteksti kun data muuttuu. useActorRefin input ei tee tätä automaattisesti
  // https://stately.ai/docs/input#passing-new-data-to-an-actor
  useEffect(() => {
    actorRef.send({
      type: JonoTulosEventType.RESET,
      input: {
        hakukohde,
        valinnanvaihe,
        valintatapajono: laskettuJono,
        onEvent: onEventCb,
      },
    });
  }, [actorRef, hakukohde, valinnanvaihe, laskettuJono, onEventCb]);
  return useJonoTulosActorRef(actorRef);
};

export const useJonoTulosActorRef = (actorRef: JonoTulosActorRef) => {
  const snapshot = useSelector(actorRef, (s) => s);
  const isDirty = useIsDirty(actorRef);
  return {
    actorRef,
    snapshot,
    isUpdating: snapshot.matches(JonoTulosState.UPDATING),
    onJonoTulosChange: (params: JonoTulosChangeParams) => {
      actorRef.send({
        type: JonoTulosEventType.JONOTULOS_CHANGED,
        ...params,
      });
    },
    saveJonoTulos: () => {
      actorRef.send({ type: JonoTulosEventType.UPDATE });
    },
    isDirty,
  };
};

export const useSelectedJarjestysperuste = (
  jonoTulosActorRef: JonoTulosActorRef,
) => {
  const jarjestysPeruste = useSelector(
    jonoTulosActorRef,
    (s) => s.context.jarjestysPeruste,
  );

  const setSelectedJarjesteysperuste = useCallback(
    (newJarjestysPeruste: JarjestysPeruste) => {
      jonoTulosActorRef.send({
        type: JonoTulosEventType.JARJESTYSPERUSTE_CHANGED,
        jarjestysPeruste: newJarjestysPeruste,
      });
    },
    [jonoTulosActorRef],
  );

  return [jarjestysPeruste, setSelectedJarjesteysperuste] as const;
};

export const useHakemusJonoTulos = (
  jonoTulosActorRef: JonoTulosActorRef,
  hakemusOid: string,
) => {
  return useSelector(
    jonoTulosActorRef,
    (s) =>
      s.context.changedJonoTulokset[hakemusOid] ??
      s.context.jonoTulokset[hakemusOid],
  );
};

export const useIsDirty = (jonoTulosActorRef: JonoTulosActorRef) =>
  useSelector(
    jonoTulosActorRef,
    (s) => !isEmpty(s.context.changedJonoTulokset),
  );
