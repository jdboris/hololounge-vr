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
    case "tel":
      return (
        value
          // NOTE: Can't convert to single-byte numbers here because of some bug that causes duplicate numbers
          // .replace(
          //   /[０-９]/g,
          //   (x) => "0123456789"["０１２３４５６７８９".indexOf(x)] || x
          // )
          .replace(/[^０-９\d]/g, "")
      );
    case "single-byte-number":
      return (
        value
          // NOTE: Can't convert to single-byte numbers because of some bug that causes duplicate numbers
          .replace(
            /[０-９]/g,
            (x) => "0123456789"["０１２３４５６７８９".indexOf(x)] || x
          )
          .replace(/[^０-９\d]/g, "")
      );
  }

  return value;
}
