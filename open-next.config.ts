const skipOpennextBuild = Boolean(process.env.SKIP_OPENNEXT_BUILD);

const config = {
  default: {},
  ...(skipOpennextBuild
    ? {
        buildCommand: 'echo "Skipping Open Next build"',
      }
    : {}),
};

export default config;
