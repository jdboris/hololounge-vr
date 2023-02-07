import theme from "@jdboris/css-themes/space-station";
import { useState } from "react";
import { useMemo } from "react";
import { useRef } from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function BookingPage() {
  const headingRef = useRef();
  const [now, setNow] = useState(toValue(new Date()));
  const [value, setValue] = useState(now);

  const openingTime = useMemo(() => {
    const datetime = new Date();
    datetime.setHours(6, 0, 0, 0);
    return datetime;
  }, []);

  const closingTime = useMemo(() => {
    const datetime = new Date();
    datetime.setHours(24, 0, 0, 0);
    return datetime;
  }, []);

  const min = useMemo(() => toValue(openingTime), [openingTime]);
  const max = useMemo(() => {
    return toValue(closingTime);
  }, [closingTime]);

  function toValue(datetime) {
    const temp = new Date();
    temp.setHours(0, 0, 0, 0);
    const hours = Math.ceil((datetime - temp) / 60 / 60 / 1000);

    return hours * 4;
  }

  function toDatetime(value) {
    const datetime = new Date();
    datetime.setHours(value / 4, (value % 4) * 15, 0, 0);
    return datetime;
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
          <FaCalendar /> Book Now
        </button>
        <form onSubmit={(e) => e.preventDefault()}>
          <header>
            <label>
              <div>
                <button
                  className={theme.altButton}
                  onClick={(e) => {
                    if (value > min) setValue(value - 1);
                  }}
                >
                  <FaChevronLeft />
                </button>
                <time>
                  {toDatetime(value).toLocaleTimeString("jp-JP", {
                    timeStyle: "short",
                  })}
                </time>

                <button
                  className={theme.altButton}
                  onClick={(e) => {
                    if (value < max) setValue(value + 1);
                  }}
                >
                  <FaChevronRight />
                </button>
              </div>
              <input
                className={theme.timeSlider}
                name="time"
                type="range"
                list="timeMarkers"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(e) => {
                  setValue(Number(e.target.value));
                }}
              />
              <datalist id="timeMarkers" className={theme.scale}>
                {Array(max + 1 - min)
                  .fill(null)
                  .map((x, i) => (
                    <option value={i + min}></option>
                  ))}
              </datalist>
            </label>
          </header>
          <main>
            <div>
              <img src="./floor-plan.png" />
            </div>
            <aside>
              <label>
                Date
                <span>
                  {toDatetime(value).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              </label>
              <label>
                Time
                <span>
                  {toDatetime(value).toLocaleTimeString(undefined, {
                    timeStyle: "short",
                  })}
                </span>
              </label>
              <label>
                Duration<span>60 (+5) minutes</span>
              </label>
              <button>Book</button>
            </aside>
          </main>
        </form>
      </main>
    </div>
  );
}
