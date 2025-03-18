const skipOpennextBuild = Boolean(process.env.SKIP_OPENNEXT_BUILD);

const config = {
  default: {},
  ...(skipOpennextBuild
    ? {
        buildCommand: 'echo "Skipping OpenNext build"',
      }
    : {}),
};

export default config;
