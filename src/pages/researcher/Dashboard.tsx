
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ResearcherDeviationReport } from '../../types/deviationReport';
import { getResearcherNotifications } from '../../services/notificationService';
import useAuth from '@/hooks/useAuth';
import type { Notification } from '../../types/notification';


const RDashboard = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<ResearcherDeviationReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifLoading, setNotifLoading] = useState(true);
    const [reviewedNotifs, setReviewedNotifs] = useState<any[]>([]);

 
    const [removingIds, setRemovingIds] = useState<string[]>([]);

   
    const handleRemoveNotification = (id: string) => {
        setRemovingIds((prev) => [...prev, id]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setReviewedNotifs((prev) => prev.filter((n) => n.id !== id));
            setRemovingIds((prev) => prev.filter((remId) => remId !== id));
        }, 300); 
    };

    const { user } = useAuth();

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            const email = user?.email;
            if (!email) {
                setSubmissions([]);
                setReviewedNotifs([]);
                setLoading(false);
            } else {
               
                const candidates: string[] = [email];
                const metaAny: any = (user as any)?.user_metadata;
                if (metaAny) {
                    if (metaAny.full_name) candidates.push(metaAny.full_name);
                    if (metaAny.name) candidates.push(metaAny.name);
                }
                const localPart = email.split('@')[0];
                if (localPart) candidates.push(localPart);

                const { data, error } = await supabase
                    .from('deviation_reports')
                    .select('*')
                    .in('reported_by', candidates)
                    .order('report_submission_date', { ascending: false });

                let rows = data || [];
                if ((!rows || rows.length === 0)) {
                    // fallback: fetch all and filter client-side
                    const { data: allData, error: allErr } = await supabase.from('deviation_reports').select('*').order('report_submission_date', { ascending: false });
                    if (!allErr) {
                        const lowerCandidates = candidates.map(c => c.toLowerCase());
                        rows = (allData || []).filter((r: any) => {
                            const rep = (r.reported_by || '').toString().toLowerCase();
                            return lowerCandidates.some(c => rep.includes(c));
                        });
                    } else {
                        console.error('Error fetching deviation_reports for dashboard fallback', allErr);
                        rows = [];
                    }
                }

                setSubmissions(rows || []);
                const reviewed = (rows || []).filter((d: any) => d.severity && d.severity !== '').map((d: any) => ({
                    id: `reviewed-${d.id}`,
                    type: 'reviewed',
                    title: 'Deviation Reviewed',
                    description: `Your Deviation "${d.protocol_title}" has been reviewed.`,
                    date: d.reviewed_at || d.updated_at || d.report_submission_date
                }));
                setReviewedNotifs(reviewed);
                setLoading(false);
            }

           
            setNotifLoading(true);
            const { data: notifData, error: notifErr } = await getResearcherNotifications();
            if (notifErr) {
                console.error('Error fetching notifications', notifErr);
                setNotifications([]);
                setNotifLoading(false);
            } else {
                const allNotifs = notifData || [];
                if (!user?.email) {
                    setNotifications([]);
                } else {
                    const lowerEmail = user.email.toLowerCase();
                 
                    const filtered = (allNotifs).filter((n: any) => {
                        if (!n) return false;
                        if (n.broadcast) return true; // keep broadcasts
                        if (n.recipient && typeof n.recipient === 'string' && n.recipient.toLowerCase() === lowerEmail) return true;
                     
                        if (Array.isArray(n.recipient) && n.recipient.map((r: string) => r.toLowerCase()).includes(lowerEmail)) return true;
                        return false;
                    });
                    setNotifications(filtered);
                }
                setNotifLoading(false);
            }
        };

        load();
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold mb-2 text-black">Dashboard</h1>
            <div className="h-2 w-48 bg-pink-500 rounded-full mb-8"></div>      

            {/* My Submissions */}
            <div className="mb-8">
                <div className="font-bold text-xl mb-3">My Submissions</div>
                <div className="border rounded-2xl overflow-hidden bg-white">
                    <div className="w-full overflow-x-auto max-h-96">
                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Loading...</div>
                        ) : submissions.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No submissions found.</div>
                        ) : (
                            <table className="w-full text-left text-base min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Submission ID</th>
                                        <th className="px-6 py-3 font-semibold">Project Title</th>
                                        <th className="px-6 py-3 font-semibold">Status</th>
                                        <th className="px-6 py-3 font-semibold">Date Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub, idx) => (
                                        <tr key={sub.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                                            <td className="px-6 py-4 font-medium">{sub.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-blue-700 font-medium">{sub.protocol_title}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-800 px-5 py-2 rounded-full font-semibold text-base">
                                                    {sub.severity && sub.severity !== '' ? 'Reviewed' : 'Pending / View'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{new Date(sub.report_submission_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <button className="mt-4 px-6 py-2 border border-black rounded-full font-semibold hover:bg-gray-100 transition" onClick={() => navigate('/researcher/submissions')}>View All Submissions</button>
            </div>

            {/* Notifications */}
            <div className="mb-8">
                <div className="font-bold text-xl mb-3">Recent Notifications</div>
                <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-xl bg-white border border-gray-100 shadow-sm">
                    {notifLoading && loading ? (
                        <div className="text-gray-500">Loading...</div>
                    ) : (notifications.length === 0 && reviewedNotifs.length === 0) ? (
                        <div className="text-gray-500">No notifications found.</div>
                    ) : (
                        [...reviewedNotifs, ...notifications].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()).map((notif) => (
                            <div
                                key={notif.id}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition rounded-lg relative group duration-300 ease-in-out
                                    ${removingIds.includes(notif.id) ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}
                                style={{ transitionProperty: 'opacity, transform' }}
                            >
                                <span className="text-2xl mt-1">
                                    {notif.type === 'reviewed' ? (
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#f87171"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    ) : notif.type === 'decision' ? (
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="20" height="24" x="2" y="2" rx="3" fill="#d1d5db"/><rect width="16" height="2" x="4" y="6" fill="#e5e7eb"/><rect width="12" height="2" x="4" y="10" fill="#e5e7eb"/></svg>
                                    ) : notif.type === 'clearance' ? (
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#34d399"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    ) : (
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#a1a1aa"/></svg>
                                    )}
                                </span>
                                <div>
                                    <div className="font-semibold text-black leading-tight">{notif.title}</div>
                                    <div className="text-gray-500 text-sm leading-tight">{notif.description}</div>
                                </div>
                                <button
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded-full"
                                    title="Remove notification"
                                    onClick={() => handleRemoveNotification(notif.id)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-8 mt-8">
                <div className="flex-1 flex flex-col items-center">
                    <div className="font-bold text-lg mb-2 text-center">View Latest Announcement and Updates</div>
                    <button className="bg-pink-500 text-white font-semibold rounded-xl px-8 py-3 text-lg shadow hover:bg-pink-600 transition">Check Announcement</button>
                </div>
                <div className="flex-1 flex flex-col items-center">
                    <div className="font-bold text-lg mb-2 text-center">About Research Ethics Committee</div>
                    <button className="bg-pink-500 text-white font-semibold rounded-xl px-8 py-3 text-lg shadow hover:bg-pink-600 transition">Learn More…</button>
                </div>
            </div>
        </div>
    );
};

export default RDashboard;