import { createFilter } from 'vite';
const filter = createFilter(/\.[jt]sx?$/);

// Direktiivi on aina rivin alussa, joten ei osuta merkkijonoihin koodin seassa.
const USE_CLIENT_DIRECTIVE = /^(['"])use client\1;?/gm;

export function removeUseClient() {
  return {
    name: 'remove-use-client',
    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      // Korvataan direktiivi saman mittaisella tyhjällä, jotta koodin sijainnit
      // eivät muutu. Silloin `map: null` säilyttää olemassa olevan sourcemapin.
      const newCode = code.replace(USE_CLIENT_DIRECTIVE, (match) =>
        ' '.repeat(match.length),
      );

      return newCode === code ? null : { code: newCode, map: null };
    },
  };
}
