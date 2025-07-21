export class AuthError extends Error {

  constructor(message: string) {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}