import React from 'react';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const groupEventsByDate = (events) => {
  const grouped = {};
  events.forEach((event) => {
    if (!grouped[event.date]) grouped[event.date] = [];
    grouped[event.date].push(event);
  });
  return grouped;
};

const themeToColor = (theme) => {
  switch (theme) {
    case 'primary': return 'bg-primary text-white';
    case 'danger': return 'bg-danger text-white';
    case 'success': return 'bg-success text-white';
    case 'warning': return 'bg-warning text-dark';
    default: return 'bg-secondary text-white';
  }
};

const GetCalendar = ({ events, year, month, onEventClick, today }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const currentDate = new Date();

const todayStr = (today ?? new Date()).toISOString().split('T')[0];

  const groupedEvents = groupEventsByDate(events);

  const weeks = [];
  let days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(<td key={`empty-start-${i}`}></td>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayEvents = groupedEvents[dateStr] || [];

     const isToday = dateStr === todayStr;

    days.push(
      <td key={day} className={`align-top p-2 border ${isToday ? 'today-highlight' : ''}`}>
        <strong>{day}</strong>
        {dayEvents.map((e, i) => (
          <div
            key={i}
            className={`mt-1 p-1 rounded ${themeToColor(e.theme)} cursor-pointer`}
            style={{ fontSize: '0.75rem', cursor: 'pointer' }}
            onClick={() => onEventClick(e)}
          >
            {e.title}
          </div>
        ))}
      </td>
    );

    if (days.length === 7) {
      weeks.push(<tr key={`week-${day}`}>{days}</tr>);
      days = [];
    }
  }

  if (days.length > 0) {
    while (days.length < 7) {
      days.push(<td key={`empty-end-${days.length}`}></td>);
    }
    weeks.push(<tr key="last-week">{days}</tr>);
  }

  return (
    <table className="table table-bordered">
      <thead className="table-light">
        <tr>
          <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
          <th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
      </thead>
      <tbody>{weeks}</tbody>
    </table>
  );
};

export default GetCalendar;
