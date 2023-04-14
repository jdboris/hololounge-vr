/**
 * @param {string} value
 * @param {{type: "date"|"tel"|"single-byte-number"|undefined}} options
 */
export function parseInput(value, { type } = {}) {
  switch (type) {
    case "date":
      return (
        value &&
        // NOTE: Add the time to the string so the Date constructor will interpret it as a LOCAL date/time
        !isNaN(new Date(`${value}T00:00`)) &&
        new Date(`${value}T00:00`)
      );
    case "datetime-local":
      return value && !isNaN(new Date(value)) && new Date(value);
    case "tel":
        if(!value) return value;

      return (
        value
          .replace(
            /[０-９]/g,
            (x) => "0123456789"["０１２３４５６７８９".indexOf(x)] || x
          )
          .replace(/[^０-９\d\+]/g, "")
      );
    case "single-byte-number":
      return (
        value
          .replace(
            /[０-９]/g,
            (x) => "0123456789"["０１２３４５６７８９".indexOf(x)] || x
          )
          .replace(/[^０-９\d]/g, "")
      );
  }

  return value;
}
