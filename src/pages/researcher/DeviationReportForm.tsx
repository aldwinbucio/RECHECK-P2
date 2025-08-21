import React, { useState } from 'react';
import { submitDeviationReport } from '../../services/deviationReportService';
import { supabase } from '../../lib/supabase';

const initialInvestigator = {
  protocolCode: '',
  protocolTitle: '',
  clearancePeriod: '',
  researcherName: '',
  researcherEmail: '',
  researcherTelephone: '',
  researcherMobile: '',
  studySite: '',
  siteEmail: '',
  siteTelephone: '',
  siteMobile: '',
  reportSubmissionDate: '',
  natureOfReport: '',
  deviationDescription: '',
  correctiveAction: '',
  assessmentSeverity: '',
  deviationDate: '',
  reportedBy: '',
  reportDate: '',
  piSignature: '',
  rationale: '',
  impact: '',
  type: '', // <-- add type
};

const initialRecReview = {
  referralType: [],
  q1: '',
  q2: '',
  recommendedActions: [],
  moreInfo: '',
  furtherAction: '',
  primaryReviewer: { date: '', signature: '', name: '' },
  secretariatStaff: { date: '', signature: '', name: '' },
  recChair: { date: '', signature: '', name: '' },
};

const referralOptions = [
  'Full Board Review by REC',
  'Expedited Review by REC Chair',
];

const recommendedActionsOptions = [
  'Uphold original approval with no further action',
  'Request more information',
  'Recommend further action',
];

const deviationTypeOptions = [
  'Informed Consent',
  'Adverse Events',
  'Sample Collection',
  'Confidentiality Breach',
  'Regulatory Compliance',
  'Other',
];

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-10">
    <div className="px-8 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
      <h2 className="text-xl font-semibold text-blue-900 tracking-tight">{title}</h2>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800 ${props.className || ''}`}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800 ${props.className || ''}`}
  />
);

const ErrorMsg: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <span className="text-xs text-red-500">{msg}</span> : null;

const DeviationReportForm = () => {
  const [investigator, setInvestigator] = useState(initialInvestigator);
  const [recReview, setRecReview] = useState(initialRecReview);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Validation helpers
const validate = () => {
  const newErrors: { [key: string]: string } = {};
  if (!investigator.protocolCode) newErrors.protocolCode = 'Required';
  if (!investigator.protocolTitle) newErrors.protocolTitle = 'Required';
  if (!investigator.deviationDate) newErrors.deviationDate = 'Required';
  if (!investigator.deviationDescription) newErrors.deviationDescription = 'Required';
  if (!investigator.rationale) newErrors.rationale = 'Required';
  if (!investigator.impact) newErrors.impact = 'Required';
  if (!investigator.correctiveAction) newErrors.correctiveAction = 'Required';
  if (!investigator.reportedBy) newErrors.reportedBy = 'Required';
  if (!investigator.reportSubmissionDate) newErrors.reportSubmissionDate = 'Required';
  if (!investigator.type) newErrors.type = 'Required'; // validate type
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Input handlers
  const handleInvestigatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInvestigator({ ...investigator, [e.target.name]: e.target.value });
  };

  const handleRecReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRecReview({ ...recReview, [e.target.name]: e.target.value });
  };

  const handleReferralType = (option: string) => {
    setRecReview((prev) => ({
      ...prev,
      referralType: prev.referralType.includes(option)
        ? prev.referralType.filter((o: string) => o !== option)
        : [...prev.referralType, option],
    }));
  };

  const handleRecommendedActions = (option: string) => {
    setRecReview((prev) => ({
      ...prev,
      recommendedActions: prev.recommendedActions.includes(option)
        ? prev.recommendedActions.filter((o: string) => o !== option)
        : [...prev.recommendedActions, option],
    }));
  };

  const handleReviewerChange = (role: 'primaryReviewer' | 'secretariatStaff' | 'recChair', field: string, value: string) => {
    setRecReview((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    let uploadedUrls: string[] = [];
    if (files.length > 0) {
      for (const file of files) {
        const { data, error } = await supabase.storage.from('deviation-uploads').upload(`reports/${Date.now()}-${file.name}`, file);
        if (error) {
          alert('File upload failed: ' + error.message);
          return;
        }
        const url = supabase.storage.from('deviation-uploads').getPublicUrl(data.path).publicUrl;
        uploadedUrls.push(url);
      }
    }
const { data, error } = await submitDeviationReport({
  protocolTitle: investigator.protocolTitle,
  protocolCode: investigator.protocolCode,
  deviationDate: investigator.deviationDate,
  deviationDescription: investigator.deviationDescription,
  rationale: investigator.rationale,
  impact: investigator.impact,
  correctiveAction: investigator.correctiveAction,
  supportingDocuments: uploadedUrls,
  reportedBy: investigator.reportedBy,
  reportSubmissionDate: investigator.reportSubmissionDate,
  type: investigator.type, // include type
});

console.log('Submission data:', data);
console.log('Submission error:', error);

if (error) {
  alert('Submission failed: ' + error.message);
} else {
  setSubmitted(true);
  alert('Deviation report submitted!');
}
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-2">
      <form className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-blue-100 px-10 py-10" onSubmit={handleSubmit} style={{ fontFamily: 'Inter, sans-serif' }}>
        <h2 className="text-3xl font-extrabold text-center mb-8 text-blue-900 tracking-tight">Submit Protocol Deviation</h2>
        <div className="space-y-6">
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Study Title</label>
            <input className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="protocolTitle" value={investigator.protocolTitle} onChange={handleInvestigatorChange} required placeholder="Enter the study title" />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Protocol Number</label>
            <input className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="protocolCode" value={investigator.protocolCode} onChange={handleInvestigatorChange} required placeholder="Enter the protocol number" />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Date of Deviation</label>
            <input className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="deviationDate" type="date" value={investigator.deviationDate} onChange={handleInvestigatorChange} required placeholder="Select date" />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Detailed Description of Deviation</label>
            <textarea className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="deviationDescription" value={investigator.deviationDescription} onChange={handleInvestigatorChange} required placeholder="Describe the deviation in detail" rows={3} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Rationale for Deviation</label>
            <textarea className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="rationale" value={investigator.rationale || ''} onChange={e => setInvestigator({ ...investigator, rationale: e.target.value })} required placeholder="Explain the rationale for the deviation" rows={2} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Impact of Deviation</label>
            <textarea className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="impact" value={investigator.impact || ''} onChange={e => setInvestigator({ ...investigator, impact: e.target.value })} required placeholder="Describe the impact of the deviation" rows={2} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Proposed Corrective Actions</label>
            <textarea className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="correctiveAction" value={investigator.correctiveAction} onChange={handleInvestigatorChange} required placeholder="Describe the corrective actions" rows={2} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Deviation Type</label>
            <select
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base"
              name="type"
              value={investigator.type}
              onChange={handleInvestigatorChange}
              required
            >
              <option value="">Select type</option>
              {deviationTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.type && <ErrorMsg msg={errors.type} />}
          </div>
          <div className="border-t border-blue-100 pt-6">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-blue-50">
              <div className="font-semibold mb-2 text-blue-900">Supporting Documents</div>
              <div className="text-sm text-gray-500 mb-2">Drag and drop or browse to upload files</div>
              <input
                type="file"
                multiple
                className="block mx-auto mt-2 text-blue-900"
                onChange={e => {
                  if (e.target.files) setFiles(Array.from(e.target.files));
                }}
              />
              {files.length > 0 && (
                <ul className="mt-2 text-left text-sm">
                  {files.map((file, idx) => (
                    <li key={idx} className="truncate text-blue-800">{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="border-t border-blue-100 pt-6">
            <label className="block font-semibold mb-1 text-blue-900">Submitted By</label>
            <input className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="reportedBy" value={investigator.reportedBy} onChange={handleInvestigatorChange} required placeholder="Enter your name" />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900">Submission Date</label>
            <input className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-base" name="reportSubmissionDate" type="date" value={investigator.reportSubmissionDate} onChange={handleInvestigatorChange} required placeholder="Select date" />
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all text-lg">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default DeviationReportForm;