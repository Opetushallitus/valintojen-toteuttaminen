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
import { produce } from 'immer';
import {
  clone,
  constant,
  filter,
  fromEntries,
  isDeepEqual,
  isNonNullish,
  isNullish,
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

export type JonoTulosContextInput = {
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

const isJonoTulosEqual = (tulos1: JonoSija, tulos2: JonoSija) => {
  return isDeepEqual(tulos1, tulos2);
};

const jonoTulosChangeReducer = ({
  context,
  event,
}: {
  context: JonoTulosContext;
  event: JonoTulosChangeEvent;
}) => {
  const { hakemusOid } = event;

  const oldJonoTulos = context.jonoTulokset[hakemusOid];

  const existingHakemusJonoTulos =
    context.changedJonoTulokset[hakemusOid] ?? context.jonoTulokset[hakemusOid];

  let newJonosija = event.jonosija ?? existingHakemusJonoTulos.jonosija ?? '';
  let newPisteet = event.pisteet ?? existingHakemusJonoTulos.pisteet ?? '';

  if (event.tuloksenTila === TuloksenTila.HYLATTY) {
    newJonosija = '';
    newPisteet = '';
  }

  let newTuloksenTila =
    event.tuloksenTila ?? existingHakemusJonoTulos.tuloksenTila;

  if (
    ((isNonNullish(event.pisteet) &&
      event.pisteet !== existingHakemusJonoTulos.pisteet) ||
      (isNonNullish(event.jonosija) &&
        event.jonosija !== existingHakemusJonoTulos.jonosija)) &&
    (isNullish(existingHakemusJonoTulos.tuloksenTila) ||
      [TuloksenTila.MAARITTELEMATON].includes(
        existingHakemusJonoTulos.tuloksenTila,
      ))
  ) {
    newTuloksenTila = TuloksenTila.HYVAKSYTTAVISSA;
  }

  const newJonoTulos = {
    hakemusOid,
    hakijaOid: existingHakemusJonoTulos.hakijaOid,
    tuloksenTila: newTuloksenTila,
    kuvaus: event.kuvaus ?? existingHakemusJonoTulos.kuvaus ?? {},
    jarjestyskriteerit: existingHakemusJonoTulos.jarjestyskriteerit,
    jonosija: newJonosija,
    pisteet: newPisteet,
  };

  return produce(context.changedJonoTulokset, (draftTulokset) => {
    if (isJonoTulosEqual(oldJonoTulos, newJonoTulos)) {
      delete draftTulokset[hakemusOid];
    } else {
      draftTulokset[hakemusOid] = newJonoTulos;
    }
  });
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
    jarjestysPeruste: (input.valintatapajono.kaytetaanKokonaispisteita
      ? 'kokonaispisteet'
      : 'jonosija') as JarjestysPeruste,
  };
};

export const jonoTulosMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCkD2A7VAVArgG1VgFkBDAYwAsBLdMAOgEkARAGQFEBiZAeQDlusAVRbcAygH0AwgAkAgrwDibJgG0ADAF1EoAA6EqAFyoZtIAB6IAtAGYAjNboBOZwCYAbNYAca+47VqAFgAaEABPK1tPOjcAtTdbF2cAgFYXaxiAdgBfLJC0TFwCYnJqWkZWTgAlNlE2LHUtJBA9WENjdFMLBFtHNzpvfzVrNWTbDOSMzxDwhEtenLyMbHxCUkoaemZ2LllK5BqsAE1RAAU2SsFRLDYpOUVlBtMWtpMmrp6+gf9h0fHJ6YiAQCCxA+WWRTWpU2FQ4ghOTFk10eTWeRleoC6MVsTkcdkcngJGTcLk81gBs1ssToARi+ICLhJjkSnmBuVBS0KqxKG3K2zhCKRtkaun0aI6b0QH36gyGIzGEymYSsLliILBnOK6zK-MRDEUHAgGHoNAAbqgANb0dUrTVQug6rB6hQIU2oMgkMUNZEi1pizqIax2Ogk8ZxWxDUbJNzk5JRNzEgJ0jIBBLhxysxYFG2QnkOp0cMAAJ0LqELdB0eA9ADNSwBbOjWiHc7Xw3WKF3oM3uz2ab3NUXtf0IQPYkPJMMR2xR8m2MZ0dIq1zWDJxEbJNUc7PN+jnSrcSocPuowcShAuNRReXfOV-RUzAKk6WDH7yyYbrNNrX0B03STcIgnOw1xMIemhPAO6LmAGc5qMmzhuOmngqgyM5EnQcQuOuIKYBAcCmI2XJfuBvonhiVjpNizhMh43i+P4wRKrM1guBk84yg+hLOFhmbgoRdpbGwxEvOKZEIGo5Iqmo768bauato6ihCX6p7iYxy4BHQ3Hsh+fE8ru+5KaRUFiTGyTJE+16-Aq0kajmLYCr+-6AXUyiGZBXSqTMCFqGxz43tZORZEAA */
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
                // Löytyy tallennettuja järjestyskriteereitä, eli tuloksia
                filter((jonoTulos) => !isEmpty(jonoTulos.jarjestyskriteerit)),
                map((jonoTulos) => {
                  return [
                    jonoTulos.hakemusOid,
                    {
                      ...jonoTulos,
                      pisteet: '',
                      jonosija: '',
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
          const valinnanvaihe: LaskettuValinnanVaiheModel = {
            ...context.valinnanvaihe,
            hakuOid: context.hakukohde.hakuOid,
          };

          const { jonoTulokset, changedJonoTulokset, valintatapajono } =
            context;

          const kaytetaanKokonaispisteita =
            context.jarjestysPeruste === 'kokonaispisteet';

          valinnanvaihe.valintatapajonot = [
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
                  const jarjestyskriteerit =
                    clone(jonoTulos.jarjestyskriteerit) ?? [];

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
                      changedJonoTulos?.kuvaus ?? jonoTulos.kuvaus ?? {};

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
          return { valinnanvaihe, hakukohde: context.hakukohde };
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
        message: 'valintalaskennan-tulokset.jonotulos-update-success',
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

  // Resetoidaan konteksti kun data muuttuu. Aktoria ei käynnistetä uudelleen automaattisesti kun input muuttuu.
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
  const isDirty = useIsJonoTulosDirty(actorRef);
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

export const useIsJonoTulosDirty = (jonoTulosActorRef: JonoTulosActorRef) =>
  useSelector(
    jonoTulosActorRef,
    (s) => !isEmpty(s.context.changedJonoTulokset),
  );
