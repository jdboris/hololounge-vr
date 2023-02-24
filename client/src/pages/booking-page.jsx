import theme from "@jdboris/css-themes/space-station";
import {
  addMinutes,
  areIntervalsOverlapping,
  format,
  minutesToMilliseconds,
} from "date-fns";
import ja from "date-fns/locale/ja";
import Booking from "dtos/booking";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendar, FaRegClock } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import InputError from "../components/input-error";
import { useModal } from "../contexts/modal";
import { useScrollRouting } from "../contexts/scroll-routing";
import "../css/react-datepicker.scss";

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

/**
 * Represents the duration of the currently "selected" (hard-coded) experience.
 */
const EXPERIENCE_DURATION = 60;

const stationCoords = [
  {
    top: "1.4%",
    right: "42.6%",
    width: "20%",
    height: "30.9%",
  },
  {
    top: "1.4%",
    right: "21.8%",
    width: "20%",
    height: "30.9%",
  },
];

const CustomInput = forwardRef(({ label, ...props }, ref) => (
  <label>
    <input {...props} type="text" ref={ref} placeholder=" " />
  </label>
));

export default function BookingPage() {
  const { navigate } = useScrollRouting();
  const url = useLocation();
  const { setModalContent } = useModal();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const sectionRef = useRef();

  const { addSection } = useScrollRouting();
  useEffect(
    () =>
      sectionRef &&
      (console.log("ADDING BOOKING SECTION: ", sectionRef) ||
        addSection({ route: "/booking", ref: sectionRef })),
    [sectionRef]
  );

  const [now, setNow] = useState(new Date());
  /**
   * @type {[Booking[], Function]}
   */
  const [allBookings, setAllBookings] = useState([]);
  /**
   * @type {[{id: string, stations: {id: string, name: string}[]}[], Function]}
   */
  const [allLocations, setAllLocations] = useState([]);

  /**
   * @type {{id: string, locationId: string, experiences: {id: string, name: string}[]}[]}
   */
  const stations = useMemo(
    () =>
      allLocations.reduce(
        (stations, location) => [
          ...stations,
          ...location.stations.map((s) => ({
            ...s,
            experiences: location.experiences,
          })),
        ],
        []
      ),
    [allLocations]
  );

  /**
   * @type {[Booking, Function]}
   */
  const [formData, setBooking] = useState({
    bookingStations: [],
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

  const [interval, setInterval] = useState(5);

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

  const bookedStationsOfDay = useMemo(() => {
    const bookingStations = [];

    allBookings.forEach((b) => {
      bookingStations.push(
        ...b.bookingStations
          .filter((bs) => {
            const { duration } = bs.experiencePrice;

            return (
              b.startTime > openingTime &&
              b.startTime < closingTime &&
              addMinutes(b.startTime, duration + interval) > openingTime &&
              addMinutes(b.startTime, duration + interval) < closingTime
            );
            // NOTE: Add the startTime to the bookingStation object as a temporary patch
          })
          .map((bs) => ({ ...bs, startTime: b.startTime }))
      );
    });

    return bookingStations;
  }, [allBookings, openingTime, closingTime]);

  // Clamp the datetime AFTER initializing opening and closing times
  useEffect(() => {
    setStartTime(formData.startTime);
  }, []);

  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isSliding) {
      // Filter out stations that are booked
      setBooking((old) => ({
        ...old,
        bookingStations: old.bookingStations.filter(
          (bs) => !isStationBooked({ id: bs.stationId })
        ),
      }));
    }
  }, [
    formData.startTime,
    // TODO: Pass in a memoized array of durations
    // formData.bookingStations.map((bs) => bs.experiencePrice.duration),
    EXPERIENCE_DURATION,
    isSliding,
  ]);

  const min = useMemo(
    () => (openingTime ? toValue(openingTime) : 0),
    [openingTime]
  );

  const max = useMemo(() => {
    return closingTime
      ? toValue(
          closingTime - minutesToMilliseconds(EXPERIENCE_DURATION + interval)
        )
      : 1;
  }, [closingTime, EXPERIENCE_DURATION]);

  function toValue(datetime) {
    return toIntervals(datetime, interval);
  }

  function toIntervals(datetime, i) {
    const midnight = new D(openingTime).setHours(0, 0, 0, 0);
    return Math.ceil((datetime - midnight) / 1000 / 60 / i);
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

  function isStationBooked(station) {
    return bookedStationsOfDay.find((bs) => {
      return (
        bs.stationId == station.id &&
        areIntervalsOverlapping(
          {
            start: formData.startTime,
            end: addMinutes(formData.startTime, EXPERIENCE_DURATION + interval),
          },
          {
            start: bs.startTime,
            end: addMinutes(
              bs.startTime,
              bs.experiencePrice.duration + interval
            ),
          }
        )
      );
    });
  }

  function addStation(station) {
    setBooking((old) => ({
      ...old,
      bookingStations: [
        ...old.bookingStations,
        {
          location: { id: station.locationId },
          stationId: station.id,
          experiencePrice: {
            experience: { id: station.experiences[0].id },
            ...station.experiences[0].experiencePrices[0],
          },
        },
      ],
    }));
  }

  function removeStation(station) {
    setBooking((old) => ({
      ...old,
      bookingStations: old.bookingStations.filter(
        (bs) => bs.stationId != station.id
      ),
    }));
  }

  useEffect(() => {
    (async () => {
      try {
        setAllBookings(
          (await (await fetch(`/api/bookings/upcoming`)).json()).map(
            (x) => new Booking(x)
          )
        );
      } catch (error) {
        console.error(error);
        console.error(error.details);
      }
    })();

    (async () => {
      try {
        setAllLocations(await (await fetch(`/api/locations`)).json());
      } catch (error) {
        console.error(error);
        console.error(error.details);
      }
    })();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("orderId")) {
      url.searchParams.delete("transactionId");
      url.searchParams.delete("orderId");
      window.history.replaceState(null, "", url);

      setModalContent(
        "Booking complete! You will receive a receipt and booking confirmation via email."
      );
    }
  }, []);

  return (
    <div ref={sectionRef} className={theme.bookingPage}>
      <header>
        <h1>Booking</h1>
      </header>
      <main>
        {url.pathname != "/" && (
          <button
            className={theme.fixedButton}
            onClick={() => {
              navigate("/booking");
            }}
          >
            <FaRegCalendar /> Book Now
          </button>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              if (dtoError) {
                throw dtoError;
              }

              setIsLoading(true);

              const response = await fetch(`/api/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking),
              });

              const { error, message, url } = await response.json();

              if (!response.ok) {
                throw error;
              }

              // setBooking({
              //   bookingStations: [],
              //   location: { id: LOCATION_ID },
              //   startTime: now,
              //   birthday: null,
              //   firstName: "",
              //   lastName: "",
              //   email: "",
              //   phone: "",
              // });
              // // NOTE: Call the setter to clamp/round
              // setStartTime(now);

              setModalContent(message);
              window.location.href = url;
            } catch (error) {
              setError(error);
            }

            setIsLoading(false);
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
            <fieldset disabled={isLoading}>
              <label>
                <FaRegCalendar />
                <ReactDatePicker
                  disabled={isLoading}
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
                  disabled={isLoading}
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
              onMouseDown={() => setIsSliding(true)}
              onTouchStart={() => setIsSliding(true)}
              onMouseUp={() => setIsSliding(false)}
              onTouchEnd={() => setIsSliding(false)}
              type="range"
              min={min}
              max={max}
              step={1}
              value={value}
              onChange={(e) => {
                setStartTime(toDatetime(e.target.value));
              }}
            />
            <datalist
              className={theme.scale}
              onClick={(e) => e.preventDefault()}
            >
              {Array(max + 1 - min)
                .fill(null)
                .map((x, i, array) => (
                  <option value={i + min} key={`time-marker-${i + min}`}>
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
            <figure className={theme.map}>
              <figcaption>
                <em>TIP: Select station(s) to reserve.</em>
              </figcaption>
              <img src="./floor-map.png" alt="Floor Map" />

              {stations.map((station, i) => (
                <label style={stationCoords[i]} key={`station-${station.id}`}>
                  <input
                    type="checkbox"
                    name="stations"
                    value={station.id}
                    disabled={isStationBooked(station)}
                    checked={
                      formData.bookingStations.find(
                        (bs) => bs.stationId == station.id
                      ) || false
                    }
                    onChange={(e) =>
                      e.stopPropagation() ||
                      hideError(e.target.name) ||
                      e.target.checked
                        ? addStation(station)
                        : removeStation(station)
                    }
                  />
                  <div>{station.name}</div>
                </label>
              ))}
            </figure>
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
                Duration
                <span>
                  {EXPERIENCE_DURATION} (+{interval}) minutes
                </span>
              </label>
              <label>
                Station(s)
                {formData.bookingStations.length ? (
                  <span>
                    {formData.bookingStations
                      .map(
                        (bs) => stations.find((s) => s.id == bs.stationId).name
                      )
                      .join(", ")}
                  </span>
                ) : (
                  <span>...</span>
                )}
              </label>
              <InputError message={error?.details?.bookingStations} />
              <fieldset disabled={isLoading}>
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
                <button>Continue to Payment</button>
              </fieldset>
            </aside>
          </main>
        </form>
      </main>
    </div>
  );
}
