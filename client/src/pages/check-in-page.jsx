import theme from "@jdboris/css-themes/space-station";
import CheckInBooking from "dtos/check-in-booking";
import { useEffect, useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheck } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import InputError from "../components/input-error";
import { useLocalization } from "../contexts/localization";
import { useModal } from "../contexts/modal";
import "../css/react-datepicker.scss";
import { toLocaleString } from "../utils/dates";
import { parseInput } from "../utils/parsing";
import { SANDBOX_MODE } from "../utils/sandbox";

function CheckInPage() {
  const { localize } = useLocalization();
  const { setModalContent } = useModal();
  const [error, setError] = useState({ details: {} });
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  /**
   * @type {[{firstName: string, lastName: string, email: string}, Function]}
   */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Reset form after every navigation
  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
    });

    setError(null);
  }, [location.pathname]);

  const [booking, dtoError] = useMemo(() => {
    try {
      return [new CheckInBooking(formData), null];
    } catch (error) {
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
                setFormData((old) => ({
                  ...old,
                  [e.target.name]: parseInput(e.target.value, {
                    type: e.target.type,
                  }),
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

                error.message = localize(error.message).replace(
                  "{startTime}",
                  toLocaleString(startTime)
                );

                throw error;
              }

              if (bookings.length && !SANDBOX_MODE) {
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
                <>
                  {message}

                  <div>
                    {bookings
                      .map(({ stations, startTime }) =>
                        stations.map((s) => (
                          <div>
                            <FaCheck className={theme.green} /> {s.name} (
                            {toLocaleString(startTime)})
                          </div>
                        ))
                      )
                      .flat()}
                  </div>
                </>
              );

              setFormData({
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

          <div className={theme.sideLines + " " + theme.h2}>OR</div>

          <fieldset disabled={isLoading}>
            <label>
              <InputError message={error?.details?.phone} />
              <input
                className={theme.alt}
                type="tel"
                name="phone"
                value={formData.phone || ""}
                placeholder=" "
                onBlur={(e) => showError(e.target.name)}
              />
              <small>Phone Number</small>
            </label>
          </fieldset>
          <InputError message={error?.message} />
          <button disabled={isLoading} className={theme.orange}>
            CHECK IN
          </button>
        </form>
      </main>
    </div>
  );
}

export default CheckInPage;
