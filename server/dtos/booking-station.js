export default class BookingStationDto {
  id = null;

  // /**
  //  * @type {string} The UUID of this booking from Springboard.
  //  */
  // idInSpringboard;

  // /**
  //  * @type {string} The UUID of this booking from Springboard.
  //  */
  // experiencePriceId;

  /**
   * @type {Date} If an ISO `string` is privded, it will be parsed.
   */
  startTime;

  /**
   * @type {Date} If an ISO `string` is privded, it will be parsed.
   */
  endTime;

  /**
   * @param {BookingStationDto} data
   */
  constructor(data) {
    Object.seal(this);
    Object.assign(this, data);

    const errors = {};

    // Validation...

    if (!this.startTime) {
      errors.startTime = "Enter your reservation's start date and time.";
    }

    if (!this.endTime) {
      errors.startTime = "Enter your reservation's start date and time.";
    }

    // Parsing...

    if (this.startTime && typeof this.startTime == "string") {
      // Parse as ISO
      this.startTime = new Date(Date.parse(this.startTime));
    }

    if (this.endTime && typeof this.endTime == "string") {
      // Parse as ISO
      this.endTime = new Date(Date.parse(this.endTime));
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
