import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';

export default function Announcements() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // determine audience visibility by role
        // fetch user role from public.users if available, otherwise fallback to auth metadata
        let role = 'researcher';
        try {
          const email = (user as any)?.email;
          if (email) {
            const { data } = await supabase.from('users').select('role').eq('email', email).single();
            if (data?.role) role = data.role.toLowerCase();
          }
        } catch (e) {
          // ignore
        }

        // audience logic: 'all' or exact audiences
        const audiences: string[] = ['all'];
        if (role === 'researcher') audiences.push('students');
        if (role === 'reviewer' || role === 'staff') audiences.push('committee');

        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(50);
        const visible = (data || []).filter((a: any) => audiences.includes(a.audience) || a.audience === 'all');
        setItems(visible as any[]);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    load();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Announcements</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No announcements.</div>
      ) : (
        <ul className="space-y-4">
          {items.map(a => (
            <li key={a.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg">{a.title}</div>
                  <div className="text-sm text-gray-600">{a.created_by_email} • {new Date(a.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-2 text-gray-700 whitespace-pre-line">{a.description}</div>
              {a.attachments && a.attachments.length > 0 && (
                <div className="mt-2">
                  {a.attachments.map((u: string, i: number) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="text-blue-600 underline mr-3">Attachment {i + 1}</a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
