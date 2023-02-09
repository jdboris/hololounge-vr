export default class BookingDto {
  id = null;
  /**
   * @type {Date} If an ISO `string` is privded, it will be parsed.
   */
  startTime;
  /**
   * @type {Date} If an ISO `string` is privded, it will be parsed.
   */
  birthday;
  firstName;
  lastName;
  email;
  phone;

  /**
   * @param {BookingDto} data
   */
  constructor(data) {
    Object.seal(this);
    Object.assign(this, data);

    for (const key in this) {
      if (this[key] === undefined) {
        throw new Error(
          `${this.constructor.name} must have a value for "${key}"`
        );
      }
    }

    const errors = {};

    if (!this.startTime) {
      errors.startTime = "Start Time is a required field.";
    }

    if (!this.birthday) {
      errors.birthday = "Enter your date of birth.";
    }

    if (!this.firstName) {
      errors.firstName = "Enter your first name.";
    }

    if (!this.lastName) {
      errors.lastName = "Enter your last name.";
    }

    if (!this.email) {
      errors.email = "Enter your email address.";
    }

    if (!this.phone) {
      errors.phone = "Enter your phone number.";
    }

    if (this.startTime && typeof this.startTime == "string") {
      // Parse as ISO
      this.startTime = new Date(Date.parse(this.startTime));
    }

    if (this.birthday && typeof this.birthday == "string") {
      // Parse as ISO
      this.birthday = new Date(Date.parse(this.birthday));
    }

    if (Object.keys(errors).length) {
      const error = new Error("");
      error.details = errors;
      throw error;
    }

    Object.freeze(this);
  }
}
