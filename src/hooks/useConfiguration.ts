'use client';
declare global {
  interface Window {
    configuration: Record<string, (params: Record<string, string | boolean | number>) => string>;
  }
}

function constructRoute(routeString: string, params: Record<string, string | boolean | number>): string {
  let route = routeString;
  Object.entries(params).forEach((entry: [string, string | number | boolean]) => {
    const value = '' + entry[1];
    route = route.replace(`{${entry[0]}}`, value);
  });
  return route;
};

export function convertConfiguration(configuration: Record<string, string>): Record<string, (params: Record<string, string | boolean | number>) => string> {
  const adjustedConfiguration = new Map<string, ((params: Record<string, string | boolean | number>) => string)>();
  Object.entries(configuration).map((entry: [string, string]) => {
    const constructFn = (params: Record<string, string | boolean | number>) => constructRoute(entry[1], params);
    adjustedConfiguration.set(entry[0], constructFn)
  });
  return Object.fromEntries(adjustedConfiguration);
}

export function setConfiguration(configuration: Record<string, (params: Record<string, string | boolean | number>) => string>) {
  window.configuration = configuration;
}

export function getConfiguration(): Record<string, (params: Record<string, string | boolean | number>) => string> {
  return window.configuration;
}
