export default class CheckInBookingDto {
  firstName;
  lastName;
  phone;

  /**
   * @param {CheckInBookingDto} data
   */
  constructor(data) {
    Object.seal(this);
    Object.assign(this, data);

    const errors = {};

    // Validation...

    if (!this.lastName && !this.firstName && !this.phone) {
      const error = new Error("Enter your full name or phone number.");
      error.details = errors;
      throw error;
    }

    // Parsing...

    if (this.phone) {
      this.phone = this.phone
        .replace(
          /[０-９]/g,
          (x) => "0123456789"["０１２３４５６７８９".indexOf(x)] || x
        )
        .replace(/\D/g, "");
    }

    // Errors...

    if (Object.keys(errors).length) {
      const error = new Error("");
      error.details = errors;
      throw error;
    }

    Object.freeze(this);
  }
}
