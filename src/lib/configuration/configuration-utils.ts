export function getConfigUrl(
  routeString: string,
  params: Record<string, string | boolean | number> = {},
): string {
  let route = routeString;
  Object.entries(params).forEach(
    (entry: [string, string | number | boolean]) => {
      const value = '' + entry[1];
      route = route.replace(`{${entry[0]}}`, value);
    },
  );
  return route;
}
