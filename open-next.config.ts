const skipOpennextBuild = Boolean(process.env.SKIP_NEXTJS_BUILD);

const config = {
  default: {},
  ...(skipOpennextBuild
    ? {
        // Tätä komentoa OpenNext kutsuu, kun se buildaa Next.js-sovelluksen
        buildCommand: 'echo "Skipping Next.js build"',
      }
    : {}),
};

export default config;
