export function getCookies() {
  return document.cookie.split('; ').reduce(
    (result, cookieStr) => {
      const [key, value] = cookieStr.split(/=(.*)$/, 2).map(decodeURIComponent);
      if (key && value) {
        result[key] = value;
      }
      return result;
    },
    {} as {
      [key: string]: string;
    },
  );
}
