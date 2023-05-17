import theme from "@jdboris/css-themes/space-station";
import {
  addMinutes,
  areIntervalsOverlapping,
  differenceInMinutes,
  isValid,
  max as maxDate,
  minutesToMilliseconds,
  parse,
  subMinutes,
  subYears,
  set,
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
  FaExclamationTriangle,
  FaInfoCircle,
  FaRegCalendar,
  FaRegClock,
} from "react-icons/fa";
import "react-phone-input-2/lib/style.css";
import { Link, useLocation } from "react-router-dom";
import InputError from "../components/input-error";
import Overlay from "../components/overlay";
import PhoneInput from "../components/phone-input";
import { useAuth } from "../contexts/auth";
import { useLocalization } from "../contexts/localization";
import { useModal } from "../contexts/modal";
import { useScrollRouting } from "../contexts/scroll-routing";
import "../css/react-datepicker.scss";
import "../css/react-phone-input-2.scss";
import useTimer from "../hooks/timer";
import { toLocaleString } from "../utils/dates";
import { parseInput } from "../utils/parsing";
import { SANDBOX_BOOKING_DATA, SANDBOX_MODE } from "../utils/sandbox";
import Keyboard from "../components/keyboard";

registerLocale("ja", ja);

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
  const startTimeInputRef = useRef();
  const startDayInputRef = useRef();

  const CustomInput = forwardRef(({ label, error, ...props }, ref) => (
    <label>
      {error && <InputError message={error} />}
      <input
        type="text"
        inputMode={root == "/pos" ? "none" : "text"}
        ref={ref}
        placeholder=" "
        {...props}
        readOnly
      />
      {label && <small>{label}</small>}
    </label>
  ));

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

  // Reset the forms and scroll to top 15 minutes after last navigation...
  const [isTimeUp, restartTimer] = useTimer(minutesToMilliseconds(15));

  useEffect(() => {
    if (root != "/pos") return;

    setError(null);
    setBooking({ ...DEFAULT_FORM_DATA });
    // NOTE: Call the setter to clamp/round
    setStartTime(now);
    setHasSelectedDay(false);
    setHasSelectedTime(false);
    setPageNumber(1);
    setIsLoading(false);

    if (url.pathname.endsWith("/booking")) {
      getBookings();
      setNow(new Date());
    }

    // Close keyboard
    document.activeElement.blur();

    restartTimer();
  }, [url.pathname]);

  useEffect(() => {
    if (root != "/pos") return;

    if (url.pathname != root) {
      startDayInputRef.current.setOpen(false);
      startTimeInputRef.current.setOpen(false);

      // NOTE: Timeout to workaround setOpen canceling the nav scrolling
      setTimeout(() => {
        navigate(root);
        setModalContent(null);
      }, 100);
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
    () =>
      set(new Date(formData.startTime), {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }),
    [formData.startTime]
  );

  const closingTime = useMemo(
    () =>
      set(new Date(formData.startTime), {
        hours: 25,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }),
    [formData.startTime]
  );

  const bookedStationsOfDay = useMemo(() => {
    const bookingStations = [];

    allBookings.forEach((b) => {
      bookingStations.push(
        ...b.bookingStations.filter((bs) => {
          return (
            bs.startTime > openingTime &&
            bs.startTime < closingTime &&
            bs.endTime > openingTime &&
            bs.endTime < closingTime
          );
        })
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

  function toValue(datetime) {
    return toIntervals(datetime, interval);
  }

  function toIntervals(datetime, i) {
    const midnight = set(new Date(openingTime), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    return Math.ceil((datetime - midnight) / 1000 / 60 / i);
  }

  function toDatetime(value) {
    if (!value) return null;

    return set(new Date(formData.startTime), {
      hours: value / (60 / interval),
      minutes: (value % (60 / interval)) * interval,
      seconds: 0,
      milliseconds: 0,
    });
  }

  function roundUp(datetime, interval) {
    return set(new Date(datetime), {
      hours: datetime.getHours(),
      minutes: Math.ceil(datetime.getMinutes() / interval) * interval,
      seconds: 0,
      milliseconds: 0,
    });
  }

  function isStationBooked(station) {
    // TODO: Establish a better way to do this (without refreshing kiosk)
    if (
      !SANDBOX_MODE &&
      (station.name == "Station A" || station.name == "Station C")
    ) {
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
              // NOTE: Add margin between bookings
              EXPERIENCE_DURATION + interval + interval
            ),
          },
          {
            start: bs.startTime,
            end: bs.endTime,
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
        <>
          <div>Booking complete!</div>
          <div>
            <FaExclamationTriangle className={theme.yellow} /> Please check in
            at the in-store kiosk when it's time to start (up to 5 minutes in
            advance).
          </div>
        </>
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
        <Keyboard
          baseClass="booking-keyboard"
          disabled={root != "/pos"}
          onChange={(value, { name, type }) => {
            if (name) {
              hideError(name);
              setBooking((old) => ({
                ...old,
                [name]: parseInput(value, {
                  type,
                }),
              }));
            }
          }}
        >
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

                const { error, id, message, redirectUrl } =
                  await response.json();

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
                                <div style={{ margin: "auto" }}>{message}</div>
                                <ul>
                                  {bookings
                                    .map(({ stations, startTime }) =>
                                      stations.map((s, i) => (
                                        <li
                                          key={"booking-confirmation-time-" + i}
                                        >
                                          <small>
                                            <FaCheck className={theme.green} />{" "}
                                            Reserved
                                          </small>
                                          {s.name} ({toLocaleString(startTime)})
                                        </li>
                                      ))
                                    )
                                    .flat()}
                                </ul>

                                {differenceInMinutes(
                                  new Date(Date.parse(bookings[0].startTime)),
                                  new Date()
                                ) <= 15 ? (
                                  <div>
                                    <FaCheck className={theme.green} /> Your
                                    experience(s) will start automatically. See
                                    the Help video and Guidebook at your station
                                    to get started.
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <FaExclamationTriangle
                                        className={theme.yellow}
                                      />{" "}
                                      Please check in to start your experience!
                                    </div>
                                    <Link
                                      className={[
                                        theme.button,
                                        theme.orange,
                                      ].join(" ")}
                                      to={root + "/check-in"}
                                      onClick={(e) =>
                                        e.preventDefault() ||
                                        navigate(root + "/check-in") ||
                                        setModalContent(null)
                                      }
                                    >
                                      CHECK IN
                                    </Link>
                                  </>
                                )}
                              </>
                            );

                            if (
                              differenceInMinutes(
                                new Date(Date.parse(bookings[0].startTime)),
                                new Date()
                              ) <= 15
                            ) {
                              setTimeout(async () => {
                                try {
                                  const response = await fetch(
                                    `/api/bookings/start`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ bookings }),
                                    }
                                  );

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
                e.target.name != "phoneCountry" &&
                e.target.type != "tel" &&
                (hideError(e.target.name) ||
                  setBooking((old) => ({
                    ...old,
                    [e.target.name]: parseInput(e.target.value, {
                      type: e.target.type,
                    }),
                  })));
            }}
          >
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
                        ref={startDayInputRef}
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
                        // Prevent virtual keyboard
                        onFocus={(e) => e.stopPropagation()}
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
                        ref={startTimeInputRef}
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
                            startTimeInputRef?.current?.calendar?.componentNode?.querySelector(
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

                          let isAtTopOrBottom = false;

                          list.onscroll = () => {
                            // If at the top or bottom
                            if (
                              list.scrollTop == 0 ||
                              list.scrollTop >=
                                list.scrollHeight - list.clientHeight
                            ) {
                              if (isAtTopOrBottom) {
                                return;
                              }

                              isAtTopOrBottom = true;
                            } else {
                              isAtTopOrBottom = false;
                            }

                            // Get the <li> in the center of the list
                            const { top, left, width, height } =
                              list.getBoundingClientRect();
                            const li = document
                              .elementsFromPoint(
                                left + width / 2,
                                top + height / 2
                              )
                              .find((x) =>
                                x.classList.contains(
                                  "react-datepicker__time-list-item"
                                )
                              );
                            if (!li) {
                              return;
                            }

                            const newValue = toValue(
                              parse(li.textContent, "HH:mm", new Date())
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
                        // Prevent virtual keyboard
                        onFocus={(e) => e.stopPropagation()}
                        locale="ja"
                        showTimeSelect
                        showTimeSelectOnly
                        shouldCloseOnSelect={false}
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
                      inputMode={root == "/pos" ? "none" : "text"}
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
                      inputMode={root == "/pos" ? "none" : "text"}
                      name="firstName"
                      value={formData.firstName || ""}
                      placeholder=" "
                      onBlur={(e) => showError(e.target.name)}
                    />
                    <small>First Name</small>
                  </label>

                  <PhoneInput
                    country={"jp"}
                    preferredCountries={["jp", "us", "ca", "cn", "kr", "in"]}
                    inputClass={theme.alt}
                    containerClass={
                      theme.label +
                      " " +
                      (error?.details?.phone ? theme.error + " error" : "")
                    }
                    specialLabel={"Phone"}
                    name="phone"
                    type="tel"
                    // inputMode={root == "/pos" ? "none" : "tel"}
                    inputMode={"tel"}
                    placeholder=" "
                    value={parseInput(formData.phone || "", { type: "tel" })}
                    onChange={(value, c, e, formattedValue) => {
                      setBooking((old) => {
                        return {
                          ...old,
                          phone: parseInput(value || "", { type: "tel" }),
                        };
                      });
                    }}
                  />

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
                      // Prevent virtual keyboard
                      onFocus={(e) => e.stopPropagation()}
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
                      // NOTE: Must use type="text" for keyboard component to work
                      type="text"
                      inputMode={root == "/pos" ? "none" : "email"}
                      name="email"
                      value={formData.email || ""}
                      placeholder=" "
                      onBlur={(e) => showError(e.target.name)}
                    />
                    <small>Email</small>
                  </label>

                  <div className={theme.row}>
                    <InputError message={error?.details?.bookingStations} />
                    <InputError message={error?.details?.phone} />

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
            {MAINTENANCE_MODE && <Overlay>COMING SOON!</Overlay>}
          </form>
        </Keyboard>
      </main>
    </div>
  );
}
