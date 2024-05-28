export class FetchError extends Error {
  response: Response;
  constructor(response: Response, message: string = 'Fetch error') {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FetchError.prototype);
    this.response = response;
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
