const eslintCommand = 'eslint --fix --no-ignore --max-warnings=0';
const prettierCommand = 'prettier --write -u';

const config = {
  '**/*.{js,mjs,cjs,jsx,ts,tsx}': [eslintCommand, prettierCommand],
  '!**/*.{js,mjs,cjs,jsx,ts,tsx}': prettierCommand,
};

export default config;
