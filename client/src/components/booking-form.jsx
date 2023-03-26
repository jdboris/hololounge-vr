import theme from "@jdboris/css-themes/space-station";
import { format } from "date-fns";
import Booking from "dtos/booking";
import { useState } from "react";
import { parseInput } from "../utils/parsing";

function BookingForm({
  firstName,
  lastName,
  email,
  bookingStation: bs,
  saveBookingStation,
  ...props
}) {
  const [mode, setMode] = useState(props.mode || "read");
  const [formData, setFormData] = useState({ ...(bs || {}) });
  const [error, setError] = useState(null);

  return (
    <form
      onChange={(e) => {
        e.target.name &&
          setFormData((old) => ({
            ...old,
            [e.target.name]: parseInput(e.target.value, {
              type: e.target.type,
            }),
          }));
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        try {
          await saveBookingStation({
            id: formData.id,
            startTime: formData.startTime,
            endTime: formData.endTime,
          });
          setMode("read");

          setError(null);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      }}
    >
      <header>
        <div className={theme.h3}>
          {lastName}, {firstName}
        </div>
        <div className={theme.h4}>{email}</div>
        <small>ID: {formData.id}</small>
      </header>
      <fieldset className={theme.alt} disabled={mode == "read"}>
        <label>
          <input
            className={theme.alt}
            type="datetime-local"
            name="startTime"
            value={format(formData.startTime, "yyyy-MM-dd'T'hh:mm")}
          />
          <small>Start</small>
        </label>
        <label>
          <input
            className={theme.alt}
            type="datetime-local"
            name="endTime"
            value={format(formData.endTime, "yyyy-MM-dd'T'hh:mm")}
          />
          <small>End</small>
          {/* <span>{toLocaleString(formData.endTime)}</span> */}
        </label>
      </fieldset>
      <footer>
        {mode == "read" && (
          <button onClick={(e) => e.preventDefault() || setMode("edit")}>
            EDIT
          </button>
        )}
        {mode == "edit" && <button>SAVE</button>}

        {error && <div className={theme.error}>{error.message}</div>}
        {error &&
          error.details &&
          Object.values(error.details).map((detail) => (
            <div className={theme.error}>{detail}</div>
          ))}
      </footer>
    </form>
  );
}

export default BookingForm;
