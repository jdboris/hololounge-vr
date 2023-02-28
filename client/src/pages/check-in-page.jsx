import theme from "@jdboris/css-themes/space-station";
import { useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import InputError from "../components/input-error";
import { useModal } from "../contexts/modal";
import "../css/react-datepicker.scss";
import { parseISO } from "date-fns";
import { toLocaleString } from "../utils/dates";

function CheckInPage() {
  const { setModalContent } = useModal();
  const [error, setError] = useState({ details: {} });
  const [isLoading, setIsLoading] = useState(false);
  /**
   * @type {[{firstName: string, lastName: string, email: string}, Function]}
   */
  const [formData, setBooking] = useState({
    firstName: "",
    lastName: "",
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
          onSubmit={async (e) => {
            e.preventDefault();

            setIsLoading(true);
            setError(null);
            try {
              if (dtoError) {
                throw dtoError;
              }

              setIsLoading(true);

              const response = await fetch(`/api/bookings/check-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking),
              });

              const { error, message, bookings } = await response.json();

              if (!response.ok) {
                const startTime = error?.details?.bookings?.[0].startTime;

                error.message = error.message.replace(
                  "{startTime}",
                  toLocaleString(startTime)
                );
                throw error;
              }

              if (bookings.length) {
                setTimeout(async () => {
                  try {
                    const response = await fetch(`/api/bookings/start`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bookings }),
                    });

                    if (!response.ok) {
                      throw error;
                    }
                  } catch (error) {
                    console.error(error);
                  }

                  // NOTE: Assuming all the bookings start at the same time.
                  //       Add a buffer of 5s to account for differences in client vs server time.
                }, Date.parse(bookings[0].startTime) - new Date() + 5000);
              }

              setModalContent(
                message
                  .replace(
                    "{verb}",
                    bookings[0].startTime < new Date()
                      ? "started"
                      : "will start"
                  )
                  .replace("{startTime}", toLocaleString(bookings[0].startTime))
              );

              setBooking({
                firstName: "",
                lastName: "",
              });
            } catch (error) {
              setError(error);
            }

            setIsLoading(false);
          }}
        >
          <fieldset disabled={isLoading}>
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
          <InputError message={error?.message} />
          <button disabled={isLoading} className={theme.orange}>
            Check In
          </button>
        </form>
      </main>
    </div>
  );
}

export default CheckInPage;
