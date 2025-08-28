export type EnvironmentName = 'untuva' | 'hahtuva' | 'pallero' | 'sade';

export const publicHostedZones: Record<EnvironmentName, string> = {
  untuva: 'untuvaopintopolku.fi',
  hahtuva: 'hahtuvaopintopolku.fi',
  pallero: 'testiopintopolku.fi',
  sade: 'opintopolku.fi',
};
