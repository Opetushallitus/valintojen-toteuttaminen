import path from 'path';

const eslintCommand = (filenames) =>
  `next lint --fix ${filenames
    .map((f) => `--file ${path.relative(process.cwd(), f)}`)
    .join(' ')}`;

const prettierCommand = 'prettier --write -u';
const typecheckCommand = 'tsc-files --noEmit';

export default {
  '**/*.{js,mjs,cjs,jsx,ts,tsx}': [eslintCommand, prettierCommand],
  '!**/*.{js,mjs,cjs,jsx,ts,tsx}': [prettierCommand],
  '**/*.{ts,tsx}': [typecheckCommand],
};
