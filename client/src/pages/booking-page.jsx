import theme from "@jdboris/css-themes/space-station";
import { forwardRef, useEffect, useState } from "react";
import { useMemo } from "react";
import { useRef } from "react";
import ReactDatePicker, {
  setDefaultLocale,
  registerLocale,
} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/react-datepicker.scss";
import ja from "date-fns/locale/ja";
import { format } from "date-fns";
import {
  FaCalendar,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaPencilAlt,
  FaRegCalendar,
  FaRegClock,
} from "react-icons/fa";
import Booking from "dtos/booking";
import InputError from "../components/input-error";
import { useModal } from "../contexts/modal";

registerLocale("ja", ja);

class D extends Date {
  constructor(...args) {
    super(...args);
  }
  setHours(...args) {
    super.setHours(...args);
    return this;
  }
}

const CustomInput = forwardRef(({ label, ...props }, ref) => (
  <label>
    <input {...props} type="text" ref={ref} placeholder=" " />
  </label>
));

export default function BookingPage() {
  useEffect(() => {
    (async () => {
      console.log(
        await (
          await fetch(
            `/api/locations/2ce14320-90cf-11ed-b97c-b18070c059f2/bookings`
          )
        ).json()
      );
    })();
  }, []);
  const { setModalContent } = useModal();

  // setModalContent(
  //   "Booking complete! You'll receive a confirmation email shortly."
  // );

  // Calendar stuff...

  const [error, setError] = useState();

  const headingRef = useRef();
  const [interval, setInterval] = useState(5);
  const [duration, setDuration] = useState((60 + 5) * 60 * 1000);
  const [now, setNow] = useState(new Date());

  const [formData, setBooking] = useState({
    startTime: now,
    birthday: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [booking, dtoError] = useMemo(() => {
    try {
      return [new Booking(formData), null];
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

  function setStartTime(startTime) {
    setBooking((old) => ({
      ...old,
      startTime: roundUp(clamp(startTime), interval),
    }));
  }

  function clamp(datetime) {
    return new Date(Math.max(openingTime, Math.min(datetime, closingTime)));
  }

  const openingTime = useMemo(
    () => new D(formData.startTime).setHours(10, 0, 0, 0),
    [formData.startTime]
  );

  const closingTime = useMemo(
    () => new D(formData.startTime).setHours(24 + 1, 0, 0, 0),
    [formData.startTime]
  );

  const value = useMemo(
    () => toValue(formData.startTime),
    [formData.startTime]
  );

  // Clamp the datetime AFTER initializing opening and closing times
  useEffect(() => {
    setStartTime(formData.startTime);
  }, []);

  const min = useMemo(
    () => (openingTime ? toValue(openingTime) : 0),
    [openingTime]
  );

  const max = useMemo(() => {
    return closingTime ? toValue(closingTime - duration) : 1;
  }, [closingTime]);

  function toIntervals(datetime, i) {
    const midnight = new D(datetime).setHours(0, 0, 0, 0);
    return Math.ceil((datetime - midnight) / 1000 / 60 / i);
  }

  function toValue(datetime, i = interval) {
    return toIntervals(datetime, i);
  }

  function toDatetime(value) {
    if (!value) return null;

    return new D(formData.startTime).setHours(
      value / (60 / interval),
      (value % (60 / interval)) * interval,
      0,
      0
    );
  }

  function roundUp(datetime, interval) {
    return new D(datetime).setHours(
      datetime.getHours(),
      Math.ceil(datetime.getMinutes() / interval) * interval,
      0,
      0
    );
  }

  return (
    <div className={theme.bookingPage}>
      <header>
        <h1 ref={headingRef}>Booking</h1>
      </header>
      <main>
        <button
          className={theme.fixedButton}
          onClick={() => {
            headingRef.current.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          <FaRegCalendar /> Book Now
        </button>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);

            if (dtoError) {
              setError(dtoError);
              return;
            }

            const response = await fetch(`/api/bookings`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(booking),
            });

            const { error, message } = await response.json();

            if (!response.ok) {
              setError(error);
              return;
            }

            setBooking({
              startTime: now,
              birthday: null,
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
            });

            setModalContent(message);
          }}
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
          <header>
            <fieldset>
              <label>
                <FaRegCalendar />
                <ReactDatePicker
                  customInput={
                    <CustomInput
                      className={[theme.medium, theme.alt].join(" ")}
                    />
                  }
                  selected={formData.startTime}
                  onChange={(date) => {
                    // Bypass the clamping/rounding if this is setting a new day
                    if (date.getDate() != formData.startTime.getDate()) {
                      setBooking((old) => ({ ...old, startTime: date }));
                      return;
                    }
                    setStartTime(date);
                  }}
                  locale="ja"
                  dateFormat="yyyy/MM/dd"
                  minDate={now}
                />
              </label>

              <label>
                <FaRegClock />
                <ReactDatePicker
                  customInput={
                    <CustomInput
                      className={[theme.small, theme.alt].join(" ")}
                    />
                  }
                  selected={formData.startTime}
                  onChange={(date) => {
                    // Bypass the clamping/rounding if this is setting a new day
                    if (date.getDate() != formData.startTime.getDate()) {
                      setBooking((old) => ({ ...old, startTime: date }));
                      return;
                    }
                    setStartTime(date);
                  }}
                  locale="ja"
                  showTimeSelect
                  showTimeSelectOnly
                  timeFormat="p"
                  dateFormat="p"
                  timeIntervals={5}
                  minTime={openingTime}
                  maxTime={
                    new D(
                      Math.min(
                        closingTime,
                        new D(formData.startTime).setHours(23, 59, 59, 999)
                      )
                    )
                  }
                />
              </label>
            </fieldset>

            <input
              className={theme.timeSlider}
              type="range"
              list="timeMarkers"
              min={min}
              max={max}
              step={1}
              value={value}
              onChange={(e) => {
                setStartTime(toDatetime(e.target.value));
              }}
            />
            <datalist id="timeMarkers" className={theme.scale}>
              {Array(max + 1 - min)
                .fill(null)
                .map((x, i, array) => (
                  <option value={i + min}>
                    {(i == 0 || i == array.length - 1) &&
                      toDatetime(i + min).toLocaleTimeString("ja-JP", {
                        timeStyle: "short",
                        hourCycle: "h23",
                      })}
                  </option>
                ))}
            </datalist>
          </header>
          <main>
            <aside>
              <div className={theme.h3}>Reservation Details</div>
              <label>
                Date
                <span>
                  {formData.startTime.toLocaleDateString("ja-JP", {
                    dateStyle: "medium",
                  })}
                </span>
              </label>
              <label>
                Start Time
                <span>
                  {formData.startTime.toLocaleTimeString("ja-JP", {
                    timeStyle: "short",
                    hourCycle: "h23",
                  })}
                </span>
              </label>
              <label>
                Duration<span>60 (+5) minutes</span>
              </label>
              <div className={theme.h3}>Contact Information</div>
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
              <label>
                <InputError message={error?.details?.email} />
                <input
                  className={theme.alt}
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  placeholder=" "
                  onBlur={(e) => showError(e.target.name)}
                />
                <small>Email</small>
              </label>
              <label>
                <InputError message={error?.details?.phone} />
                <input
                  className={theme.alt}
                  type="phone"
                  name="phone"
                  value={formData.phone || ""}
                  placeholder=" "
                  onBlur={(e) => showError(e.target.name)}
                />
                <small>Phone</small>
              </label>
              <label>
                <InputError message={error?.details?.birthday} />
                <input
                  className={theme.alt}
                  type="date"
                  name="birthday"
                  value={
                    formData.birthday
                      ? format(formData.birthday, "yyyy-MM-dd")
                      : ""
                  }
                  placeholder=" "
                  onBlur={(e) => showError(e.target.name)}
                />
                <small>Date of Birth</small>
              </label>

              <InputError message={error?.message} />
              <button>Book</button>
            </aside>
          </main>
        </form>
      </main>
    </div>
  );
}
