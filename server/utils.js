export class HttpError extends Error {
  constructor(message, status = 500, details = {}) {
    super(message);
    this.status = status;
    Object.assign(this, details);
  }
}
