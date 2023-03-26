import theme from "@jdboris/css-themes/space-station";
import Booking from "dtos/booking";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";

import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "../css/react-datepicker.scss";
import BookingForm from "../components/booking-form";
import { useModal } from "../contexts/modal";

function BookingsPage() {
  const { currentUser, authenticate, error, setError, isLoading } = useAuth();
  const navigate = useNavigate();

  const { setModalContent } = useModal();

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser]);

  /**
   * @type {[Booking[], Function]}
   */
  const [allBookings, setAllBookings] = useState([]);

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
  }, []);

  return (
    <main className={theme.bookingsPage}>
      <section>
        <ul>
          {allBookings.map(({ firstName, lastName, email, bookingStations }) =>
            bookingStations.map((bs) => (
              <li key={"booking-list-form-" + bs.id}>
                <BookingForm
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  bookingStation={bs}
                  saveBookingStation={async (bs) => {
                    const response = await fetch(
                      `/api/bookings/booking-stations/${bs.id}`,
                      {
                        method: "PUT",
                        body: JSON.stringify(bs),
                        headers: {
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    const { message, error } = await response.json();

                    if (!response.ok) {
                      throw error;
                    }

                    setModalContent(message);
                  }}
                />
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}

export default BookingsPage;
