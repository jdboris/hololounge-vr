import theme from "@jdboris/css-themes/space-station";
import { useEffect, useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import InputError from "../components/input-error";
import "../css/react-datepicker.scss";

function CheckInPage() {
  const navigate = useNavigate();

  const [error, setError] = useState();
  /**
   * @type {[{firstName: string, lastName: string, email: string}, Function]}
   */
  const [formData, setBooking] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [booking, dtoError] = useMemo(() => {
    try {
      return [formData, null];
    } catch (error) {
      if (!error.details) {
        throw error;
      }

      return [null, error];
    }
  }, [formData]);

  /**
   * @param {string} name The name of the field to show the error for.
   */
  const showError = (name) => {
    setError({
      message: error?.message,
      details: {
        ...error?.details,
        [name]: dtoError?.details[name],
      },
    });
  };

  /**
   * @param {string} name The name of the field to hide the error for.
   */
  const hideError = (name) => {
    setError({
      message: error?.message,
      details: {
        ...error?.details,
        [name]: undefined,
      },
    });
  };

  return (
    <div className={theme.checkinPage}>
      <header>
        <h1>Check-In</h1>
      </header>
      <main>
        <form
          onChange={(e) => {
            e.target.name &&
              (hideError(e.target.name) ||
                setBooking((old) => ({
                  ...old,
                  [e.target.name]:
                    e.target.type == "date"
                      ? e.target.value &&
                        // NOTE: Add the time to the string so the Date constructor will interpret it as a LOCAL date/time
                        !isNaN(new Date(`${e.target.value}T00:00`)) &&
                        new Date(`${e.target.value}T00:00`)
                      : e.target.value,
                })));
          }}
        >
          <fieldset>
            <label>
              <InputError message={error?.details?.lastName} />
              <input
                className={theme.alt}
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                placeholder=" "
                onBlur={(e) => showError(e.target.name)}
              />
              <small>Last Name</small>
            </label>
            <label>
              <InputError message={error?.details?.firstName} />
              <input
                className={theme.alt}
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                placeholder=" "
                onBlur={(e) => showError(e.target.name)}
              />
              <small>First Name</small>
            </label>
          </fieldset>
          <button className={theme.orange}>Check In</button>
        </form>
      </main>
    </div>
  );
}

export default CheckInPage;
