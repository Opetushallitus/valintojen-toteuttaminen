import path from 'path';

const eslintCommand = (filenames) =>
  `next lint --fix --no-ignore --max-warnings=0 ${filenames
    .map((f) => `--file ${path.relative(process.cwd(), f)}`)
    .join(' ')}`;

const prettierCommand = 'prettier --write -u';

const config = {
  '**/*.{js,mjs,cjs,jsx,ts,tsx}': [eslintCommand, prettierCommand],
  '!**/*.{js,mjs,cjs,jsx,ts,tsx}': [prettierCommand],
};

export default config;
