import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { University, Application } from '../lib/supabase';
import { mockUniversitiesFull } from '../lib/mockData';

interface Props {
  applications?: Application[];
}

interface CalendarEvent {
  date: Date;
  universities: Array<{
    university: University;
    type: 'deadline' | 'exam';
    isApplied: boolean;
  }>;
}

// Generate exam date (typically 15-30 days after application deadline)
const getExamDate = (deadline: Date): Date => {
  const examDate = new Date(deadline);
  examDate.setDate(examDate.getDate() + Math.floor(Math.random() * 15) + 15); // 15-30 days after deadline
  return examDate;
};

export default function AdmissionCalendar({ applications = [] }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get all events (deadlines and exam dates) - memoized for performance
  const events = useMemo((): CalendarEvent[] => {
    const eventsMap = new Map<string, CalendarEvent>();

    mockUniversitiesFull.forEach(uni => {
      const deadline = new Date(uni.deadline);
      const examDate = getExamDate(deadline);
      const isApplied = applications.some(app => app.university_id === uni.id);

      // Add deadline event
      const deadlineKey = deadline.toDateString();
      if (!eventsMap.has(deadlineKey)) {
        eventsMap.set(deadlineKey, { date: deadline, universities: [] });
      }
      eventsMap.get(deadlineKey)!.universities.push({
        university: uni,
        type: 'deadline',
        isApplied,
      });

      // Add exam event
      const examKey = examDate.toDateString();
      if (!eventsMap.has(examKey)) {
        eventsMap.set(examKey, { date: examDate, universities: [] });
      }
      eventsMap.get(examKey)!.universities.push({
        university: uni,
        type: 'exam',
        isApplied,
      });
    });

    return Array.from(eventsMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [applications]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent['universities'] => {
    const dateKey = date.toDateString();
    const event = events.find(e => e.date.toDateString() === dateKey);
    return event ? event.universities : [];
  };

  // Check if date has events
  const hasEvents = (date: Date): boolean => {
    return getEventsForDate(date).length > 0;
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    const hasDeadline = dayEvents.some(e => e.type === 'deadline');
    const hasExam = dayEvents.some(e => e.type === 'exam');
    const hasApplied = dayEvents.some(e => e.isApplied);

    return (
      <div className="absolute bottom-1 left-0 right-0 flex flex-col gap-0.5 px-1">
        {hasDeadline && (
          <div className="w-full h-1 bg-red-500 rounded"></div>
        )}
        {hasExam && (
          <div className="w-full h-1 bg-blue-500 rounded"></div>
        )}
        {hasApplied && (
          <div className="w-full h-0.5 border border-green-500 rounded"></div>
        )}
        {dayEvents.length > 0 && (
          <div className="text-[9px] font-bold text-blue-600 text-center">
            {dayEvents.length}
          </div>
        )}
      </div>
    );
  };

  // Custom tile className for styling
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const classes: string[] = [];
    const dayEvents = getEventsForDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.toDateString() === today.toDateString()) {
      classes.push('ring-2 ring-blue-500 bg-blue-50');
    }

    if (dayEvents.length > 0) {
      classes.push('relative pb-6');
      if (dayEvents.some(e => e.isApplied)) {
        classes.push('border-2 border-green-400');
      }
    }

    if (checkDate < today) {
      classes.push('opacity-60');
    }

    return classes.join(' ');
  };

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => {
      const daysDiff = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 30;
    }).slice(0, 10);
  }, [events]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <CalendarIcon className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Admission Exam Schedule</h3>
            <p className="text-sm text-slate-600">All university deadlines and exam dates</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-xs text-slate-600">Application Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-xs text-slate-600">Admission Exam</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-green-500"></div>
          <span className="text-xs text-slate-600">You Applied</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <style>{`
            .react-calendar {
              width: 100%;
              border: none;
              font-family: inherit;
            }
            .react-calendar__navigation {
              display: flex;
              height: 44px;
              margin-bottom: 1em;
            }
            .react-calendar__navigation button {
              min-width: 44px;
              background: none;
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus {
              background-color: #f1f5f9;
            }
            .react-calendar__navigation button[disabled] {
              background-color: #f8fafc;
            }
            .react-calendar__month-view__weekdays {
              text-align: center;
              text-transform: uppercase;
              font-weight: 600;
              font-size: 0.75rem;
              color: #64748b;
              padding-bottom: 0.5rem;
            }
            .react-calendar__month-view__weekdays__weekday {
              padding: 0.5em;
            }
            .react-calendar__month-view__days__day {
              padding: 0.5em;
              min-height: 60px;
            }
            .react-calendar__tile {
              max-width: 100%;
              text-align: center;
              padding: 0.75em 0.5em;
              background: none;
              border: 1px solid #e2e8f0;
              border-radius: 0.5rem;
              margin: 2px;
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: #dbeafe;
            }
            .react-calendar__tile--now {
              background: #dbeafe;
            }
            .react-calendar__tile--active {
              background: #3b82f6;
              color: white;
            }
            .react-calendar__tile--active:enabled:hover,
            .react-calendar__tile--active:enabled:focus {
              background: #2563eb;
            }
          `}</style>
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            next2Label={null}
            prev2Label={null}
            navigationLabel={({ date, label, locale, view }) => {
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
              return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            }}
            formatShortWeekday={(locale, date) => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return dayNames[date.getDay()];
            }}
          />
        </div>

        {/* Selected Date Details & Upcoming Events */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && selectedDateEvents.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Events on {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              <div className="space-y-2">
                {selectedDateEvents.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-3 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        item.type === 'deadline'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type === 'deadline' ? 'Deadline' : 'Exam'}
                      </span>
                      {item.isApplied && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{item.university.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {item.university.city}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedDateEvents.length === 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
              <p className="text-sm text-slate-500">No events on this date</p>
            </div>
          )}

          {/* Upcoming Events List */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Upcoming Events (Next 30 Days)
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    onClick={() => setSelectedDate(event.date)}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                      event.universities[0].type === 'deadline' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <span className="text-xs font-bold text-slate-600">
                        {event.date.getDate()}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {event.date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          event.universities[0].type === 'deadline'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.universities[0].type === 'deadline' ? 'Deadline' : 'Exam'}
                        </span>
                        {event.universities.some(u => u.isApplied) && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                            Applied
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {event.universities.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900 truncate">
                              {item.university.name}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={12} />
                              {item.university.city}
                            </span>
                          </div>
                        ))}
                        {event.universities.length > 2 && (
                          <p className="text-xs text-slate-500">
                            +{event.universities.length - 2} more universities
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming events in the next 30 days</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
