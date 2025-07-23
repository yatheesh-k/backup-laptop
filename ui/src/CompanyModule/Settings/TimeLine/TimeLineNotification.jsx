import  { useEffect, useState } from "react";
import { getDueDates } from "../../../Utils/Axios";

const TimeLineNotification = () => {
  const [dueDates, setDueDates] = useState(null);
  const currentDay = new Date().getDate();

  useEffect(() => {
    fetchDueDates();
  }, []);

  const fetchDueDates = async () => {
    try {
      const response = await getDueDates();
      if (response.data && response.data.length > 0) {
        setDueDates(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch due dates", error);
    }
  };

  const renderDueDate = (label, day) => {
    if (!day) return null;
    const dayNum = parseInt(day, 10);
    const isToday = dayNum === currentDay;
    const isUpcoming = dayNum > currentDay;
    const isOverdue = dayNum < currentDay;

    let bgClass = "";
    if (isToday) bgClass = "due-today";
    else if (isUpcoming) bgClass = "due-upcoming";
    else if (isOverdue) bgClass = "due-overdue";

    return (
      <li className={`list-group-item due-item d-flex justify-content-between align-items-center ${bgClass}`} key={label}>
        <span className="due-label">
          <i className="bi bi-calendar-event-fill me-2"></i>
          {label} Due Date
        </span>
        <span className="badge rounded-pill due-day">{day}</span>
      </li>
    );
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4">
        <i className="bi bi-bell-fill text-primary me-2"></i>
        Monthly Time Lines
      </h4>

      {!dueDates ? (
        <div className="text-muted">No Due Dates Added</div>
      ) : (
        <ul className="list-group shadow-sm">
          {renderDueDate("PF", dueDates.pfDay)}
          {renderDueDate("GST", dueDates.gstDay)}
          {renderDueDate("TDS", dueDates.tdsDay)}
          {renderDueDate("PT", dueDates.ptDay)}
        </ul>
      )}
    </div>
  );
};

export default TimeLineNotification;
