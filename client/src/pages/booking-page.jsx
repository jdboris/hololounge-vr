import theme from "@jdboris/css-themes/space-station";
import {
  addMinutes,
  areIntervalsOverlapping,
  isValid,
  max as maxDate,
  minutesToMilliseconds,
  parse,
  subMinutes,
  subYears,
} from "date-fns";
import ja from "date-fns/locale/ja";
import Booking from "dtos/booking";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCreditCard,
  FaInfoCircle,
  FaRegCalendar,
  FaRegClock,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import InputError from "../components/input-error";
import Overlay from "../components/overlay";
import { useAuth } from "../contexts/auth";
import { useLocalization } from "../contexts/localization";
import { useModal } from "../contexts/modal";
import { useScrollRouting } from "../contexts/scroll-routing";
import "../css/react-datepicker.scss";
import useTimer from "../hooks/timer";
import { toLocaleString } from "../utils/dates";
import { SANDBOX_BOOKING_DATA, SANDBOX_MODE } from "../utils/sandbox";

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
    top: "1.5%",
    left: "1.2%",
    width: "31.6%",
    height: "31%",
  },
  {
    top: "1.5%",
    left: "34.1%",
    width: "31.6%",
    height: "31%",
  },
  {
    top: "1.5%",
    left: "67.1%",
    width: "31.6%",
    height: "31%",
  },
  {
    top: "67.6%",
    left: "1.2%",
    width: "31.6%",
    height: "31%",
  },
  { top: "67.6%", left: "34.2%", width: "31.6%", height: "31%" },
  { top: "67.6%", left: "67.1%", width: "31.6%", height: "31%" },
];

const CustomInput = forwardRef(({ label, error, ...props }, ref) => (
  <label>
    {error && <InputError message={error} />}
    <input type="text" ref={ref} placeholder=" " {...props} readOnly />
    {label && <small>{label}</small>}
  </label>
));

export default function BookingPage() {
  const { currentUser } = useAuth();

  const MAINTENANCE_MODE = useMemo(
    () =>
      process.env.REACT_APP_MAINTENANCE_MODE.toLowerCase() == "true" &&
      (!currentUser || currentUser.email != process.env.REACT_APP_ADMIN_EMAIL),
    [currentUser]
  );
  const { localize } = useLocalization();
  const { setModalContent } = useModal();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { navigate, root } = useScrollRouting();
  const url = useLocation();
  const timeSelectRef = useRef();

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

  const DEFAULT_FORM_DATA = SANDBOX_MODE
    ? { ...SANDBOX_BOOKING_DATA }
    : {
        bookingStations: [],
        startTime: now,
        birthday: null,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      };

  /**
   * @type {[Booking, Function]}
   */
  const [formData, setBooking] = useState({ ...DEFAULT_FORM_DATA });

  // Reset the forms and scroll to top 5 minutes after last navigation...
  const [isTimeUp, restartTimer] = useTimer(minutesToMilliseconds(5));

  useEffect(() => {
    if (root != "/pos") return;

    setError(null);
    setBooking({ ...DEFAULT_FORM_DATA });
    // NOTE: Call the setter to clamp/round
    setStartTime(now);
    setHasSelectedDay(false);
    setHasSelectedTime(false);
    setPageNumber(1);

    if (url.pathname.endsWith("/booking")) {
      getBookings();
      setNow(new Date());
    }

    restartTimer();
  }, [url.pathname]);

  useEffect(() => {
    if (root != "/pos") return;

    if (url.pathname != root) {
      navigate(root);
    }
  }, [isTimeUp]);

  const [hasSelectedDay, setHasSelectedDay] = useState(false);
  const [hasSelectedTime, setHasSelectedTime] = useState(false);

  const [booking, dtoError] = useMemo(() => {
    try {
      return [
        new Booking({
          ...formData,
          startTime:
            hasSelectedDay && hasSelectedTime ? formData.startTime : null,
        }),
        null,
      ];
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

  /**
   * @param {Date} startTime
   */
  function setStartTime(startTime) {
    setBooking((old) => ({
      ...old,
      startTime: clamp(roundUp(startTime, interval)),
    }));
  }

  function clamp(datetime) {
    return new Date(
      Math.max(
        Math.max(openingTime, roundUp(now, interval)),
        Math.min(
          datetime,
          subMinutes(closingTime, EXPERIENCE_DURATION + interval)
        )
      )
    );
  }

  const openingTime = useMemo(
    () => new D(formData.startTime).setHours(SANDBOX_MODE ? 0 : 10, 0, 0, 0),
    [formData.startTime]
  );

  const closingTime = useMemo(
    () => new D(formData.startTime).setHours(SANDBOX_MODE ? 23 : 23, 0, 0, 0),
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
              addMinutes(b.startTime, duration + interval + interval) >
                openingTime &&
              addMinutes(b.startTime, duration + interval + interval) <
                closingTime
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

  // const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    // if (!isSliding) {
    // Filter out stations that are booked
    setBooking((old) => ({
      ...old,
      bookingStations: old.bookingStations.filter(
        (bs) => !isStationBooked({ id: bs.stationId })
      ),
    }));
    // }
  }, [
    formData.startTime,
    // TODO: Pass in a memoized array of durations
    // formData.bookingStations.map((bs) => bs.experiencePrice.duration),
    EXPERIENCE_DURATION,
    // isSliding,
  ]);

  // const min = useMemo(
  //   () => (openingTime ? toValue(openingTime) : 0),
  //   [openingTime]
  // );

  // const max = useMemo(() => {
  //   return closingTime
  //     ? toValue(
  //         closingTime - minutesToMilliseconds(EXPERIENCE_DURATION + interval)
  //       )
  //     : 1;
  // }, [closingTime, EXPERIENCE_DURATION]);

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
    if (!SANDBOX_MODE && station.name == "Station A") {
      return true;
    }

    return bookedStationsOfDay.find((bs) => {
      return (
        bs.stationId == station.id &&
        areIntervalsOverlapping(
          {
            start: subMinutes(formData.startTime, interval),
            end: addMinutes(
              formData.startTime,
              EXPERIENCE_DURATION + interval + interval
            ),
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

  async function getBookings() {
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
  }

  useEffect(() => {
    getBookings();

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
        localize(
          "Booking complete! You will receive a receipt and booking confirmation via email. Please check in at the in-store kiosk up to 5 minutes in advance."
        )
      );
    }
  }, []);

  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div className={theme.bookingPage}>
      <header>
        <h1>Booking</h1>
      </header>
      <main>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              if (dtoError) {
                throw dtoError;
              }

              if (pageNumber == 1) {
                setPageNumber(2);
                return;
              }

              setIsLoading(true);

              const response = await fetch(`/api/checkout`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  // NOTE: In case the browser doesn't set it automatically...
                  referer: window.location.origin + window.location.pathname,
                },
                body: JSON.stringify(booking),
              });

              const { error, id, message, redirectUrl } = await response.json();

              if (!response.ok) {
                throw error;
              }

              if (!SANDBOX_MODE) {
                setBooking({ ...DEFAULT_FORM_DATA });
                // NOTE: Call the setter to clamp/round
                setStartTime(now);
                setHasSelectedDay(false);
                setHasSelectedTime(false);
                setPageNumber(1);
              }

              if (redirectUrl) {
                setModalContent(message, { canClose: SANDBOX_MODE });
                if (!SANDBOX_MODE) {
                  // NOTE: Required to workaround Square's bug where the link responds with 404 if you redirect too quickly
                  setTimeout(() => {
                    window.location.href = redirectUrl;
                  }, 3000);
                }
              } else {
                setModalContent(message, { canClose: false });

                // TODO: Clear these timeouts in a useEffect cleanup
                const result = await (async () => {
                  const LIMIT = 40;
                  for (let i = 0; i < LIMIT; i++) {
                    const result = await new Promise((resolve, reject) => {
                      setTimeout(async () => {
                        const response = await fetch(`/api/checkout/${id}`);
                        const {
                          error,
                          message,
                          isComplete,
                          isCanceled,
                          startTime,
                          bookings,
                        } = await response.json();
                        // NOTE: May receive 304, which is considered "not OK" by response.ok
                        // if (!response.ok) {
                        if (error && response.status != 404) {
                          setModalContent(error.message);
                          return reject(error);
                        }

                        if (isComplete) {
                          setModalContent(
                            <>
                              {message}

                              <div>
                                {bookings
                                  .map(({ stations, startTime }) =>
                                    stations.map((s, i) => (
                                      <div
                                        key={"booking-confirmation-time-" + i}
                                      >
                                        <FaCheck className={theme.green} />{" "}
                                        {s.name} ({toLocaleString(startTime)})
                                      </div>
                                    ))
                                  )
                                  .flat()}
                              </div>
                            </>
                          );

                          return resolve(true);
                        }

                        if (isCanceled) {
                          return resolve(false);
                        }

                        resolve(null);
                      }, 3000);
                    });

                    if (result !== null) return result;
                  }
                })();

                if (!result) {
                  setModalContent(null);
                }

                navigate(root);
              }
            } catch (error) {
              setError(error);
            }

            getBookings();
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
            {/* <input
              disabled={isLoading || MAINTENANCE_MODE}
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
            </datalist> */}
          </header>
          <main>
            {pageNumber == 1 && (
              <figure className={theme.map}>
                <figcaption>
                  <em>
                    {error?.details?.bookingStations ? (
                      <InputError message={error?.details?.bookingStations} />
                    ) : (
                      <>
                        <FaInfoCircle />
                        Select station(s) to reserve.
                      </>
                    )}
                  </em>
                </figcaption>
                <img src="/floor-map.png" alt="Floor Map" />

                {stations.map((station, i) => (
                  <label style={stationCoords[i]} key={`station-${station.id}`}>
                    <input
                      type="checkbox"
                      name="bookingStations"
                      value={station.id}
                      disabled={isStationBooked(station) || MAINTENANCE_MODE}
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
            )}
            <aside>
              {pageNumber == 1 && (
                <fieldset disabled={isLoading || MAINTENANCE_MODE}>
                  <div className={theme.startTimeFields}>
                    <div className={theme.h3}>Start Time</div>
                    <InputError message={error?.details?.startTime} />
                    <label>
                      <FaRegCalendar />
                      <ReactDatePicker
                        withPortal
                        disabled={isLoading || MAINTENANCE_MODE}
                        customInput={
                          <CustomInput
                            className={[theme.medium, theme.alt].join(" ")}
                          />
                        }
                        selected={hasSelectedDay && formData.startTime}
                        onCalendarOpen={() => setHasSelectedDay(true)}
                        onChange={(date) => {
                          if (!date || !(date instanceof Date)) return;

                          setHasSelectedDay(true);
                          if (hasSelectedTime) hideError("startTime");

                          // Bypass the clamping/rounding if this is setting a new day
                          if (date.getDate() != formData.startTime.getDate()) {
                            setBooking((old) => ({ ...old, startTime: date }));
                            return;
                          }

                          setStartTime(date);
                        }}
                        locale="ja"
                        dateFormat="yyyy/MM/dd"
                        placeholderText="YYYY/MM/DD"
                        minDate={now}
                      />
                    </label>
                    <label>
                      <FaRegClock />
                      <ReactDatePicker
                        disabled={isLoading || MAINTENANCE_MODE}
                        customInput={
                          <CustomInput
                            className={[theme.small, theme.alt].join(" ")}
                          />
                        }
                        ref={timeSelectRef}
                        onCalendarOpen={() => {
                          setNow(new Date());
                          setHasSelectedTime(true);
                          if (hasSelectedDay) hideError("startTime");
                          const newStartTime = roundUp(
                            formData.startTime,
                            interval
                          );
                          setStartTime(newStartTime);

                          // WARNING: HACKS
                          const list =
                            timeSelectRef?.current?.calendar?.componentNode?.querySelector(
                              ".react-datepicker__time-list"
                            );
                          if (!list) return;

                          let selectedValue = toValue(
                            clamp(roundUp(formData.startTime, interval))
                          );

                          setTimeout(
                            () =>
                              list
                                .querySelector(
                                  ".react-datepicker__time-list-item--selected"
                                )
                                ?.scrollIntoViewIfNeeded(),
                            10
                          );

                          list.onscroll = () => {
                            const position =
                              list.scrollTop + list.clientHeight / 2;

                            const newValue = Math.floor(
                              position / list.firstElementChild.offsetHeight
                            );
                            if (selectedValue != newValue) {
                              selectedValue = newValue;
                              setStartTime(toDatetime(newValue));
                            }
                          };
                        }}
                        selected={hasSelectedTime && formData.startTime}
                        onChange={(date) => {
                          if (!date || !(date instanceof Date)) return;

                          setHasSelectedTime(true);

                          setStartTime(date);
                        }}
                        locale="ja"
                        showTimeSelect
                        showTimeSelectOnly
                        timeFormat="HH:mm"
                        dateFormat="HH:mm"
                        placeholderText="HH:MM"
                        timeIntervals={interval}
                        minTime={maxDate([openingTime, roundUp(now, interval)])}
                        maxTime={subMinutes(
                          closingTime,
                          EXPERIENCE_DURATION + interval
                        )}
                      />
                    </label>
                  </div>
                  <label className={theme.duration}>
                    Duration
                    <span>
                      {/* NOTE: Separate "min." for localization */}
                      {EXPERIENCE_DURATION} (+{interval}) <>min.</>
                    </span>
                  </label>
                  <div className={theme.h3}>Contact</div>
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
                    <ReactDatePicker
                      disabled={MAINTENANCE_MODE}
                      withPortal
                      customInput={
                        <CustomInput
                          className={theme.alt}
                          label={"Date of Birth"}
                          error={error?.details?.birthday}
                        />
                      }
                      placeholderText="YYYY/MM/DD"
                      name="birthday"
                      selected={formData.birthday}
                      onChangeRaw={(e) => {
                        e.stopPropagation();

                        // If this event is hijacked by react-datepicker...
                        if (e.target.value === undefined) return;
                        e.target.value = e.target.value.replace(/[-\\ ]/g, "/");

                        const date = parse(
                          e.target.value,
                          "yyyy/MM/dd",
                          new Date()
                        );
                        if (!isValid(date)) {
                          return;
                        }

                        setBooking((old) => ({
                          ...old,
                          birthday: date,
                        }));
                      }}
                      onChange={(value) => {
                        setBooking((old) => ({
                          ...old,
                          birthday: value,
                        }));
                      }}
                      onBlur={(e) => showError(e.target.name)}
                      locale="ja"
                      dateFormat="yyyy/MM/dd"
                      maxDate={subYears(now, 13)}
                      showMonthDropdown
                      showYearDropdown
                      yearDropdownItemNumber={110}
                      scrollableYearDropdown
                    />
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

                  <div className={theme.row}>
                    <InputError message={error?.details?.bookingStations} />

                    <InputError message={error?.message} />
                    <button className={theme.blue}>
                      CONTINUE
                      <FaArrowRight />
                    </button>
                  </div>
                </fieldset>
              )}
              {pageNumber == 2 && (
                <div>
                  <div className={theme.h3}>Summary</div>
                  <label>
                    Date
                    <span>
                      {hasSelectedDay
                        ? formData.startTime.toLocaleDateString("ja-JP", {
                            dateStyle: "medium",
                          })
                        : "..."}
                    </span>
                  </label>
                  <label>
                    Start Time
                    <span>
                      {hasSelectedTime
                        ? formData.startTime.toLocaleTimeString("ja-JP", {
                            timeStyle: "short",
                            hourCycle: "h23",
                          })
                        : "..."}
                    </span>
                  </label>
                  <label>
                    Duration
                    <span>
                      {/* NOTE: Separate "min." for localization */}
                      {EXPERIENCE_DURATION} (+{interval}) <>min.</>
                    </span>
                  </label>
                  <label className={theme.row}>
                    Station(s)
                    {formData.bookingStations.length ? (
                      <>
                        {formData.bookingStations.map((bs, i, array) => (
                          <span key={"order-details-station-" + i}>
                            {localize(
                              stations.find((s) => s.id == bs.stationId).name
                            )}
                            {i < array.length - 1 && ", "}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span>...</span>
                    )}
                  </label>
                  <label>
                    Total
                    {formData.bookingStations.length ? (
                      <span>
                        ¥
                        {formData.bookingStations.reduce(
                          (total, bs) =>
                            total + Number(bs.experiencePrice.price),
                          0
                        )}
                      </span>
                    ) : (
                      <span>...</span>
                    )}
                  </label>
                  <button
                    disabled={isLoading || MAINTENANCE_MODE}
                    className={theme.red}
                    onClick={(e) => e.preventDefault() || setPageNumber(1)}
                  >
                    <FaArrowLeft />
                    BACK
                  </button>

                  <InputError message={error?.message} />
                  <button
                    disabled={isLoading || MAINTENANCE_MODE}
                    className={theme.blue}
                  >
                    <FaCreditCard />
                    PAY WITH CREDIT CARD
                  </button>
                </div>
              )}
            </aside>
          </main>
          {MAINTENANCE_MODE && <Overlay>COMING SOON!</Overlay>}
        </form>
      </main>
    </div>
  );
}
