import { act, render } from '@testing-library/react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v8';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect } from 'vitest';

/**
 * Renderöi hookin oikean nuqs-adapterin ja reitittimen sisällä ja tallentaa hookin palauttaman arvon jokaisella renderöinnillä.
 */
export const renderSearchParamsHook = <T,>(
  useHook: () => T,
  initialSearch = '',
) => {
  window.history.replaceState(null, '', `/${initialSearch}`);
  const renders: Array<T> = [];
  const current = { value: undefined as T };

  const HookRunner = () => {
    const value = useHook();
    renders.push(value);
    current.value = value;
    return null;
  };

  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <NuqsAdapter>
            <HookRunner />
          </NuqsAdapter>
        ),
      },
    ],
    { initialEntries: [`/${initialSearch}`] },
  );
  render(<RouterProvider router={router} />);

  return { renders, current };
};

export const waitForUrlUpdates = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 200)));

export const getUrlParam = (key: string) =>
  new URLSearchParams(window.location.search).get(key);

/**
 * Tarkistaa muutoksen jälkeisistä renderöinneistä, että kun arvo on kerran vaihtunut uuteen,
 * se ei palaa hetkellisestikään vanhaan arvoon.
 */
export const expectNoStaleValues = <V,>(
  valuesAfterChange: Array<V>,
  newValue: V,
) => {
  const values = valuesAfterChange;
  const firstNewValueIndex = values.indexOf(newValue);
  expect(firstNewValueIndex).toBeGreaterThanOrEqual(0);
  expect(values.slice(firstNewValueIndex)).toEqual(
    values.slice(firstNewValueIndex).map(() => newValue),
  );
};
