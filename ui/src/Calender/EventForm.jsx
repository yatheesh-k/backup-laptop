import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDeleteByIdApi,
  calendarPatchAPIById,
  calendarPostAPI,
} from "../Utils/Axios";
import { fetchCalendarData } from "../Redux/CalendarSlice";
import LayOut from "../LayOut/LayOut";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const LOCAL_KEY = "calendar_draft_events";

const EventForm = () => {
  const {
    register,
    formState: { errors },
    trigger,
    setError,
    clearErrors,
  } = useForm({
    mode: "onChange",
  });

  const dispatch = useDispatch();
  const { data: calendarData, loading } = useSelector(
    (state) => state.calendar
  );
  const [newEvent, setNewEvent] = useState({
    event: "",
    theme: "primary",
    date: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteYearTarget, setDeleteYearTarget] = useState(null);
  const [editingBackendEvent, setEditingBackendEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [localCalendarData, setLocalCalendarData] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0); // Add force update trigger

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchCalendarData());
  }, [dispatch]);

  useEffect(() => {
    if (calendarData) {
      setLocalCalendarData(calendarData);
    }
  }, [calendarData]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(parseInt(monthNumber, 10) - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
    if (name === "event") {
      const validation = validateEventTitle(value);
      if (validation !== true) {
        setError("event", { type: "manual", message: validation });
      } else {
        clearErrors("event");
      }
    }
  };

  const isPastDate = (inputDate) => {
    const selected = new Date(inputDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    if (!newEvent.event || !newEvent.date) {
      return setMessage({ type: "danger", text: "All fields are required." });
    }

    if (isPastDate(newEvent.date)) {
      return setMessage({
        type: "danger",
        text: "Cannot add events in the past.",
      });
    }

    if (editingBackendEvent) {
      const { yearId, month, date } = editingBackendEvent;
      const yearEntry = localCalendarData.find((entry) => entry.id === yearId);

      if (yearEntry) {
        const updatedDateEntityList = yearEntry.dateEntityList.map((block) => {
          if (block.month === month) {
            const existingEventIndex = block.holidaysEntities.findIndex(
              (evt) => evt.date === date
            );
            const updatedHolidays = [...block.holidaysEntities];
            const newEventData = {
              event: newEvent.event,
              theme: newEvent.theme,
              date: new Date(newEvent.date)
                .getDate()
                .toString()
                .padStart(2, "0"),
            };

            if (existingEventIndex >= 0) {
              updatedHolidays[existingEventIndex] = newEventData;
            } else {
              updatedHolidays.push(newEventData);
            }

            return { ...block, holidaysEntities: updatedHolidays };
          }
          return block;
        });

        try {
          await calendarPatchAPIById(
            { dateEntityList: updatedDateEntityList },
            yearId
          );

          // Update local state immediately
          const updatedData = localCalendarData.map((year) =>
            year.id === yearId
              ? { ...year, dateEntityList: updatedDateEntityList }
              : year
          );
          setLocalCalendarData(updatedData);
          setForceUpdate((prev) => prev + 1); // Force re-render

          setMessage({
            type: "success",
            text: "✅ Event updated successfully!",
          });
          setEditingBackendEvent(null);
          setNewEvent({ event: "", theme: "primary", date: "" });
        } catch (error) {
          setMessage({ type: "danger", text: "Failed to update event" });
        }
        return;
      }
    }

    const duplicate = events.some(
      (evt, idx) =>
        idx !== editingIndex &&
        evt.date === newEvent.date &&
        evt.event === newEvent.event
    );
    if (duplicate) {
      return setMessage({
        type: "danger",
        text: "Duplicate event for same date.",
      });
    }

    if (editingIndex !== null) {
      const updated = [...events];
      updated[editingIndex] = newEvent;
      setEvents(updated);
      setEditingIndex(null);
    } else {
      setEvents([...events, newEvent]);
    }

    setNewEvent({ event: "", theme: "primary", date: "" });
    setMessage(null);
    setForceUpdate((prev) => prev + 1);
  };

  const handleEdit = (index) => {
    setNewEvent(events[index]);
    setEditingIndex(index);
    setEditingBackendEvent(null);
  };

  const handleDelete = (index) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    if (editingIndex === index) {
      setNewEvent({ event: "", theme: "primary", date: "" });
      setEditingIndex(null);
    }
  };

  const validateEventTitle = (value) => {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      return "Event title is required.";
    }
    if (/^\s/.test(value)) {
      return "No leading spaces allowed.";
    }
    if (/\s$/.test(value)) {
      return "No trailing spaces allowed.";
    }
    if (/\s{2,}/.test(trimmedValue)) {
      return "No multiple consecutive spaces allowed.";
    }
    if (trimmedValue.length < 3) {
      return "Event title must be at least 3 characters.";
    }
    if (trimmedValue.length > 60) {
      return "Event title must be no more than 60 characters.";
    }
    if (!/[a-zA-Z0-9]/.test(trimmedValue)) {
      return "Event title must include at least one letter or number.";
    }
    if (!/^[a-zA-Z0-9\s\-:’'&,().!]+$/.test(trimmedValue)) {
      return "Event title contains invalid characters.";
    }

    return true;
  };

  const getMergedEventsForMonth = (year, month) => {
    // Get backend events
    const backendEvents = [];
    const yearEntry = localCalendarData.find((y) => y.year.toString() === year);
    if (yearEntry) {
      const monthBlock = yearEntry.dateEntityList.find(
        (m) => m.month === month
      );
      if (monthBlock) {
        backendEvents.push(
          ...monthBlock.holidaysEntities.map((evt) => ({
            ...evt,
            source: "backend",
          }))
        );
      }
    }

    // Get local events for this month
    const localEvents = events
      .filter((evt) => {
        const dt = new Date(evt.date);
        return (
          dt.getFullYear().toString() === year &&
          (dt.getMonth() + 1).toString().padStart(2, "0") === month
        );
      })
      .map((evt) => ({
        ...evt,
        date: new Date(evt.date).getDate().toString().padStart(2, "0"),
        source: "local",
      }));

    // Merge and group by day
    const merged = [...backendEvents, ...localEvents];
    const dayEventMap = {};

    merged.forEach((evt) => {
      const day = parseInt(evt.date);
      if (!dayEventMap[day]) {
        dayEventMap[day] = [];
      }
      dayEventMap[day].push(evt);
    });

    return dayEventMap;
  };

  const handleDeleteEvent = async (evt, yearEntry, monthBlock) => {
    setIsDeleting(true);
    try {
      const updatedHolidays = monthBlock.holidaysEntities.filter(
        (e) => !(e.date === evt.date && e.event === evt.event)
      );

      const updatedDateEntityList = yearEntry.dateEntityList.map((block) =>
        block.month === monthBlock.month
          ? { ...block, holidaysEntities: updatedHolidays }
          : block
      );

      await calendarPatchAPIById(
        { dateEntityList: updatedDateEntityList },
        yearEntry.id
      );

      // Update local state immediately
      const updatedData = localCalendarData.map((year) =>
        year.id === yearEntry.id
          ? { ...year, dateEntityList: updatedDateEntityList }
          : year
      );
      setLocalCalendarData(updatedData);
      setForceUpdate((prev) => prev + 1); // Force re-render

      setMessage({ type: "success", text: "Event deleted successfully" });
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to delete event" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    const grouped = {};

    events.forEach(({ event, theme, date }) => {
      const dt = new Date(date);
      const year = dt.getFullYear().toString();
      const month = (dt.getMonth() + 1).toString().padStart(2, "0");
      const day = dt.getDate().toString().padStart(2, "0");

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];

      grouped[year][month].push({ event, theme, date: day });
    });

    const postPayloads = [];
    const patchPayloads = [];

    for (const [year, monthData] of Object.entries(grouped)) {
      const existingYearEntry = localCalendarData.find(
        (entry) => entry.year.toString() === year
      );

      if (existingYearEntry) {
        const existingMap = {};
        existingYearEntry.dateEntityList.forEach((monthBlock) => {
          existingMap[monthBlock.month] = [...monthBlock.holidaysEntities];
        });

        for (const [month, holidaysEntities] of Object.entries(monthData)) {
          if (!existingMap[month]) {
            existingMap[month] = holidaysEntities;
          } else {
            holidaysEntities.forEach((newEvt) => {
              const isDuplicate = existingMap[month].some(
                (evt) => evt.date === newEvt.date && evt.event === newEvt.event
              );
              if (!isDuplicate) {
                existingMap[month].push(newEvt);
              }
            });
          }
        }

        const mergedDateEntityList = Object.entries(existingMap).map(
          ([month, holidaysEntities]) => ({
            month,
            holidaysEntities,
          })
        );

        patchPayloads.push({
          id: existingYearEntry.id,
          dateEntityList: mergedDateEntityList,
        });
      } else {
        const dateEntityList = Object.entries(monthData).map(
          ([month, holidaysEntities]) => ({
            month,
            holidaysEntities,
          })
        );
        postPayloads.push({ year, dateEntityList });
      }
    }

    try {
      for (const payload of postPayloads) {
        await calendarPostAPI(payload);
      }

      for (const { id, dateEntityList } of patchPayloads) {
        await calendarPatchAPIById({ dateEntityList }, id);
      }

      toast.success("🎉 Events submitted successfully!", {
        autoClose: 2000,
        onClose: () => {
          dispatch(fetchCalendarData());
          setEvents([]);
          localStorage.removeItem(LOCAL_KEY);
          setEditingIndex(null);
        },
      });
    } catch (error) {
      const errMsg =
        error?.response?.data?.error?.message || "Submission failed.";
      toast.error(`❌ ${errMsg}`);
    }

    setShowConfirm(false);
  };

  const handleDeleteYear = async () => {
    if (!deleteYearTarget) return;
    try {
      await CalendarDeleteByIdApi(deleteYearTarget.id);

      // Update local state
      const updatedData = localCalendarData.filter(
        (year) => year.id !== deleteYearTarget.id
      );
      setLocalCalendarData(updatedData);
      setForceUpdate((prev) => prev + 1); // Force re-render

      setMessage({
        type: "success",
        text: `🗑️ Deleted year ${deleteYearTarget.year}`,
      });
      setDeleteYearTarget(null);
    } catch (error) {
      setMessage({ type: "danger", text: "❌ Failed to delete year" });
    }
  };

  const renderCalendar = () => {
    if (!selectedYear || !selectedMonth) return null;

    // Get the year and month data from backend
    const yearEntry = localCalendarData.find(
      (y) => y.year.toString() === selectedYear
    );
    const monthBlock = yearEntry?.dateEntityList.find(
      (m) => m.month === selectedMonth
    );

    // Get merged events (backend + local)
    const dayEventMap = getMergedEventsForMonth(selectedYear, selectedMonth);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDay = new Date(`${selectedYear}-${selectedMonth}-01`).getDay();

    const rows = [];
    let currentDay = 1 - firstDay;

    for (let week = 0; week < 6; week++) {
      const cells = [];

      for (let d = 0; d < 7; d++) {
        if (currentDay > 0 && currentDay <= daysInMonth) {
          const formattedDate = `${selectedYear}-${selectedMonth}-${String(
            currentDay
          ).padStart(2, "0")}`;

          cells.push(
            <td
              key={d}
              className="align-top"
              style={{ height: "80px", width: "150px" }}
            >
              <div className="fw-bold">{currentDay}</div>
              {dayEventMap[currentDay]?.map((evt, idx) => (
                <div key={idx} className="small">
                  <div className={`badge bg-${evt.theme} mt-1`}>
                    {evt.event}
                    {evt.source === "local" && " (unsaved)"}
                  </div>
                  {evt.source === "backend" && yearEntry && monthBlock ? (
                    <div className="mt-1">
                      <button
                        className="btn btn-sm btn-outline-info me-1"
                        onClick={() => {
                          setNewEvent({
                            event: evt.event,
                            theme: evt.theme,
                            date: formattedDate,
                          });
                          setEditingBackendEvent({
                            yearId: yearEntry.id,
                            year: yearEntry.year,
                            month: selectedMonth,
                            date: evt.date,
                          });
                          setEditingIndex(null);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDeleteEvent(evt, yearEntry, monthBlock)
                        }
                      >
                        {isDeleting ? "Deleting..." : "❌"}
                      </button>
                    </div>
                  ) : (
                    // For local events, show remove button
                    <div className="mt-1">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          const eventIndex = events.findIndex(
                            (e) =>
                              e.event === evt.event && e.date === formattedDate
                          );
                          if (eventIndex >= 0) {
                            handleDelete(eventIndex);
                          }
                        }}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </td>
          );
        } else {
          cells.push(<td key={d}></td>);
        }
        currentDay++;
      }

      rows.push(<tr key={week}>{cells}</tr>);
    }

    return (
      <div
        className="table-responsive"
        key={`calendar-${selectedYear}-${selectedMonth}-${forceUpdate}`}
      >
        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody style={{ maxWidth: "150px", maxHeight: "80px" }}>{rows}</tbody>
        </table>
      </div>
    );
  };

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>Calendar</strong>{" "}
          </h1>
        </div>
        <div className="col-auto">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/main" className="custom-link">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active">
                <a href="/AddEvent">Calendar</a>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header">
          ➕{" "}
          {editingIndex !== null || editingBackendEvent
            ? "Edit Event"
            : "Add Event"}
        </div>
        <div className="card-body">
          <form onSubmit={handleAddOrUpdate}>
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="text"
                  name="event"
                  placeholder="Event Title"
                  value={newEvent.event}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
                {errors.event && (
                  <p className="errorMsg">{errors.event.message}</p>
                )}
              </div>
              <div className="col-md-3">
                <select
                  name="theme"
                  value={newEvent.theme}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="primary">🔵 Primary</option>
                  <option value="secondary">⚫ Secondary</option>
                  <option value="danger">🔴 Danger</option>
                  <option value="success">🟢 Success</option>
                  <option value="warning">🟠 Warning</option>
                  <option value="info">🔷 Info</option>
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-success w-100">
                  {editingIndex !== null || editingBackendEvent
                    ? "✅ Update"
                    : "➕ Add"}
                </button>
              </div>
            </div>
          </form>
          {message && (
            <div className={`alert alert-${message.type} mt-3`}>
              {" "}
              <hr />
              {message.text}
            </div>
          )}

          {events.length > 0 && (
            <>
              <hr />
              <h6>📝 Events to Submit</h6>
              <ul className="list-group mb-3">
                {events.map((e, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      📅 <strong>{e.date}</strong> — {e.event}
                      <span className={`badge bg-${e.theme} ms-2`}>
                        {e.theme}
                      </span>
                    </span>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-info me-1"
                        onClick={() => handleEdit(i)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(i)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-primary"
                onClick={() => setShowConfirm(true)}
              >
                🚀 Submit All
              </button>
              <hr />
            </>
          )}

          {localCalendarData?.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                <div className="mb-0">
                  <h6>📅 Existing Events</h6>
                  <span className="text-sm text-info">
                    Please select Year and Month to display Events
                  </span>
                </div>
                <div className="d-flex align-items-center gap-3 ms-auto">
                  <div>
                    <label className="form-label mb-0 small">Select Year</label>
                    <select
                      className="form-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">-- Select Year --</option>
                      {localCalendarData.map((yearEntry) => (
                        <option key={yearEntry.id} value={yearEntry.year}>
                          {yearEntry.year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label mb-0 small">
                      Select Month
                    </label>
                    <select
                      className="form-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">-- Select Month --</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = String(i + 1).padStart(2, "0");
                        return (
                          <option key={month} value={month}>
                            {getMonthName(month)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {selectedYear && selectedMonth && (
                <>
                  <h6 className="mt-3 text-primary">
                    📆 {getMonthName(selectedMonth)} {selectedYear}
                  </h6>
                  {renderCalendar()}
                </>
              )}
            </>
          )}

          {/* Modals */}
          {deleteYearTarget && (
            <div
              className="modal show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setDeleteYearTarget(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete all events for year{" "}
                    <strong>{deleteYearTarget.year}</strong>?
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setDeleteYearTarget(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteYear}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showConfirm && (
            <div
              className="modal show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Submission</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowConfirm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to submit these events?
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-success" onClick={handleSubmit}>
                      Yes, Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayOut>
  );
};

export default EventForm;
