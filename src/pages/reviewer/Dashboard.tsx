import { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import {
  getReviewerStats,
  getActivities,
  getUpcomingDeadlines,
  getAssignedReviews,
} from '../../services/reviewer';
import useAuth from '../../hooks/useAuth.ts';
import { supabase } from '@/lib/supabase';

export default function ReviewerDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [reviewerStats, setReviewerStats] = useState<{ label: string; value: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();

  

  useEffect(() => {
    let mounted = true;
    if (authLoading) return; 
    setLoading(true);

   
  const assignedPromise = user ? getAssignedReviews(user.id) : Promise.resolve([]);

    Promise.all([
      getReviewerStats(),
      getActivities(),
      getUpcomingDeadlines(),
      assignedPromise,
    ])
      .then(async ([stats, activities, deadlines, assigned]) => {
        if (!mounted) return;

        setReviewerStats(Array.isArray(stats) ? stats : []);
        setUpcomingDeadlines(Array.isArray(deadlines) ? deadlines : []);

       
        const assignedActivities = (Array.isArray(assigned) ? assigned : []).map((r: any, i: number) => ({
          id: `assign-${r?.id ?? i}`,
          type: 'assignment',
          title: `New Proposal Assigned: ${r?.proposal?.title || 'Untitled Proposal'}`,
          date: r?.date_assigned || r?.created_at || new Date().toISOString(),
        }));

       
        const baseActivities = Array.isArray(activities) ? activities : [];

        
        const { data: annData } = await supabase
          .from('announcements')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(6);
        const annActivities = (annData || []).map((a: any, i: number) => ({
          id: `anno-${a.id ?? i}`,
          type: 'announcement',
          title: `Announcement: ${a.title}`,
          date: a.created_at,
        }));

        const merged = [...assignedActivities, ...annActivities, ...baseActivities].sort((a: any, b: any) => {
          const da = new Date(a?.date || 0).getTime();
          const db = new Date(b?.date || 0).getTime();
          return db - da;
        });

  setRecentActivities(merged);
      })
      .catch((err) => {
        console.error('ReviewerDashboard load error:', err);
        if (!mounted) return;
        setReviewerStats([]);
        setRecentActivities([]);
        setUpcomingDeadlines([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  const deadlineDates = (upcomingDeadlines || [])
    .map((d: any) => {
      const due = d.due || d.dueDate || d.date;
      if (!due) return null;
      const parsed = Date.parse(due);
      if (!isNaN(parsed)) return new Date(parsed);
      const parts = String(due).replace(/,/g, '').split(' ');
      if (parts.length >= 3) return new Date(`${parts[0]} ${parts[1]}, ${parts[2]}`);
      return null;
    })
    .filter(Boolean) as Date[];

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2">
      <button
        type="button"
        className="px-2 py-1 rounded hover:bg-blue-100"
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
      >
        &lt;
      </button>
      <div className="text-center text-gray-700 font-medium">
        {format(currentMonth, 'MMMM yyyy')}
      </div>
      <button
        type="button"
        className="px-2 py-1 rounded hover:bg-blue-100"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
      >
        &gt;
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(startOfMonth(currentMonth));
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-gray-500 text-sm font-medium">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days: any[] = [];
    let day = startDate;
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const isDeadline = deadlineDates.some(
          (d) => isSameDay(d, day) && isSameMonth(d, currentMonth)
        );
        days.push(
          <div
            key={day.toString()}
            className={`py-1 rounded-lg cursor-pointer text-center text-sm ${
              isSameMonth(day, monthStart) ? '' : 'text-gray-300'
            } ${
              isSameDay(day, selectedDate)
                ? 'bg-blue-600 text-white font-bold'
                : isDeadline
                ? 'bg-blue-100 text-red-700 font-bold'
                : 'hover:bg-blue-50'
            }`}
            onClick={() => setSelectedDate(day)}
          >
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center text-gray-500">
        Loading reviewer dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reviewer Dashboard</h1>

      {/* Overview */}
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-700 mb-2">Overview</div>
        <div className="flex gap-8 mb-6 justify-center">
          {(reviewerStats || []).map((stat: any) => (
            <div
              key={stat.label}
              className="bg-gray-50 border border-gray-200 rounded-xl px-8 py-6 flex flex-col items-center min-w-[160px] shadow-sm"
            >
              <div className="text-lg font-medium text-gray-600 mb-2">{stat.label}</div>
              <div className="text-3xl font-bold text-blue-700">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-700 mb-2">Recent Activities</div>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 rounded-lg">
          {(recentActivities || []).map((activity: any, idx: number) => {
            const isRemoving = removingIds.includes(activity.id || String(idx));
            return (
              <div
                key={activity.id || idx}
                className={`flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3 shadow-sm transform transition-all duration-300 ${isRemoving ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0'}`}>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    activity.type === 'assignment'
                      ? 'bg-blue-200 text-blue-700'
                      : activity.type === 'announcement'
                      ? 'bg-yellow-200 text-yellow-700'
                      : 'bg-green-200 text-green-700'
                  }`}
                >
                  {activity.type === 'assignment' ? '📄' : activity.type === 'announcement' ? '📣' : '✔️'}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{activity.title}</div>
                  <div className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</div>
                </div>
                <button
                  aria-label="Remove"
                  className="text-gray-400 hover:text-red-500 p-1 rounded"
                  onClick={() => {
                    const id = activity.id || String(idx);
                    setRemovingIds(prev => [...prev, id]);
                    setTimeout(() => {
                      setRecentActivities(prev => prev.filter((it: any) => (it.id || '') !== id));
                      setRemovingIds(prev => prev.filter(i => i !== id));
                    }, 300);
                  }}>
                  &times;
                </button>
              </div>
            );
          })}
          {(!recentActivities || recentActivities.length === 0) && (
            <div className="text-sm text-gray-500">No recent activities.</div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-700 mb-2">Upcoming Deadlines</div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-center mb-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-w-[320px]">
              {renderHeader()}
              {renderDays()}
              {renderCells()}
            </div>
          </div>
          {(upcomingDeadlines || []).map((deadline: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3 shadow-sm"
            >
              <span className="w-6 h-6 rounded bg-blue-200 text-blue-700 flex items-center justify-center">
                📅
              </span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{deadline.title}</div>
                <div className="text-xs text-gray-500">
                  Due: {deadline.due || deadline.dueDate || deadline.date}
                </div>
              </div>
            </div>
          ))}
          {(!upcomingDeadlines || upcomingDeadlines.length === 0) && (
            <div className="text-sm text-gray-500">No upcoming deadlines.</div>
          )}
        </div>
      </div>
    </div>
  );
}
