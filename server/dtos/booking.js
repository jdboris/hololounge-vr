export default class BookingDto {
  id = null;

  /**
   * @type {string} The UUID of this booking from Springboard.
   */
  idInSpringboard;

  /**
   * @type {string} The ID of the order associated with this booking in Square.
   */
  squareOrderId;

  /**
   * @type {boolean}
   */
  isComplete;

  /**
   * @type {boolean}
   */
  isCanceled;

  /**
   * @type {boolean}
   */
  isCheckedIn;

  /**
   * @type {Array<{location: {id: string}, stationId: string, experiencePrice: {id: string, duration: number, price: number, experience: {id: string}}}>} The `BookingStation`'s that coincides with "bookingTimes" in Springboard.
   */
  bookingStations;

  /**
   * @type {Date} If an ISO `string` is privded, it will be parsed. Meant to be applied to all `Experience`'s.
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

    const errors = {};

    // Validation...

    if (!Array.isArray(this.bookingStations) || !this.bookingStations.length) {
      errors.bookingStations = "Select station(s) to reserve.";
    }

    if (!this.startTime) {
      errors.startTime = "Enter your reservation's start date and time.";
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

    if (
      !this.email.match(
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
      )
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!this.email) {
      errors.email = "Enter your email address.";
    }

    if (
      !this.phone.match(
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
      )
    ) {
      errors.phone = "Enter a valid phone number.";
    }

    if (!this.phone) {
      errors.phone = "Enter your phone number.";
    }

    // Parsing...

    if (this.startTime && typeof this.startTime == "string") {
      // Parse as ISO
      this.startTime = new Date(Date.parse(this.startTime));
    }

    this.bookingStations.forEach((bs) => {
      if (bs.startTime && typeof bs.startTime == "string") {
        // Parse as ISO
        bs.startTime = new Date(Date.parse(bs.startTime));
      }
      if (bs.endTime && typeof bs.endTime == "string") {
        // Parse as ISO
        bs.endTime = new Date(Date.parse(bs.endTime));
      }
    });

    if (this.birthday && typeof this.birthday == "string") {
      // Parse as ISO
      this.birthday = new Date(Date.parse(this.birthday));
    }

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
