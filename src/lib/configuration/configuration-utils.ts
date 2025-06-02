export function getConfigUrl(
  routeString: string,
  params: Record<string, string | boolean | number> = {},
): string {
  let route = routeString;
  Object.entries(params).forEach(
    (entry: [string, string | number | boolean]) => {
      const value = '' + entry[1];
      const placeholder = `{${entry[0]}}`;
      if (!route.includes(placeholder)) {
        console.warn(
          `Placeholder ${placeholder} not found in route ${routeString}. Using value: ${value}`,
        );
      }

      route = route.replace(`{${entry[0]}}`, value);
    },
  );

  if (/\{[^}]+\}/.test(route)) {
    throw new Error(
      `Not all placeholders were replaced in route ${routeString}. Result: ${route}`,
    );
  }
  return route;
}
