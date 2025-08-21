import React, { useState } from 'react';


export default function CreateAnnouncement() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<'students' | 'committee' | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-black text-center tracking-tight">Create Announcement</h1>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Enter announcement title"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Enter announcement description"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800 min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Attachments</label>
          <div className="flex gap-3 items-center">
            <label className="border border-dashed border-blue-300 rounded-lg px-4 py-2 text-blue-700 cursor-pointer hover:bg-blue-50 transition flex items-center">
              <span className="mr-2 text-lg">📎</span> Add Attachments
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachment}
              />
            </label>
            {attachments.length > 0 && (
              <span className="text-xs text-gray-500">{attachments.length} file(s) selected</span>
            )}
          </div>
          {attachments.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 border rounded-lg bg-gray-50 p-3">
              {attachments.map((file, idx) => (
                <li key={idx} className="flex items-center justify-between py-1">
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Audience</label>
          <div className="flex gap-3">
            <button
              type="button"
              className={`border rounded-lg px-5 py-2 font-medium transition ${audience === 'students' ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setAudience('students')}
            >
              All Students
            </button>
            <button
              type="button"
              className={`border rounded-lg px-5 py-2 font-medium transition ${audience === 'committee' ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setAudience('committee')}
            >
              Committee
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Preview</label>
          <div className="rounded-2xl border-2 border-dashed border-blue-200 min-h-[120px] flex items-end bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="p-6 m-4 max-w-md w-full">
              <div className="font-bold text-xl mb-1 text-blue-900">{title || 'Announcement Title'}</div>
              <div className="text-base text-gray-700 whitespace-pre-line">{description || 'Announcement description will appear here.'}</div>
              <div className="mt-2 text-xs text-blue-700">
                {audience ? `Audience: ${audience === 'students' ? 'All Students' : 'Committee'}` : 'Select audience'}
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 text-xs text-blue-500">
                  Attachments: {attachments.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button className="text-gray-500 hover:underline font-medium" type="button">Cancel</button>
          <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200" type="button">Announce</button>
        </div>
      </div>
    </div>
  );
}
