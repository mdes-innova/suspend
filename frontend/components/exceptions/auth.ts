export const AUTH_ERROR_CODE = 'AUTH_NO_REFRESH';

type AuthErrorCause = {
  code?: string
}

type AuthErrorType = {
  code: string,
  name: string,
  cause?: AuthErrorCause,
  message?: string
}

export class AuthError extends Error {
  code = AUTH_ERROR_CODE;
  constructor(message = 'Auth error', options?: ErrorOptions) {
    super(message, options);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, AuthError);
  }
}

export function isAuthError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const a = e as AuthErrorType;
  const msg = String(a?.message ?? '');
  return (
    a.code === AUTH_ERROR_CODE ||
    a.name === 'AuthError' ||
    a?.cause?.code === AUTH_ERROR_CODE ||
    // last-ditch heuristics for dev mode
    msg.includes('AuthError') || msg.includes(AUTH_ERROR_CODE)
  );
}