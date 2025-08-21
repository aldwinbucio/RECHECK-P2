import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ResearcherDeviationReport } from '../../types/deviationReport';

const FeedbackDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deviation, setDeviation] = useState<ResearcherDeviationReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        supabase
            .from('deviation_reports')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data }) => {
                setDeviation(data || null);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading feedback details...</div>;
    if (!deviation) return <div className="p-8 text-center text-gray-400">Feedback not found.</div>;

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <button className="mb-6 text-blue-600 hover:underline" onClick={() => navigate(-1)}>&larr; Back</button>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                    Feedback Details
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 bg-gray-100 ${deviation.severity === 'Minor' ? 'border border-blue-500 text-blue-700' : ''} ${deviation.severity === 'Major' ? 'border border-red-500 text-red-700' : ''}`}>{deviation.severity || '-'}</span>
                </h2>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Project Title: </span>
                    <span className="text-blue-700 font-medium">{deviation.protocol_title}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Researcher: </span>
                    <span>{deviation.reported_by}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Date Reported: </span>
                    <span>{new Date(deviation.report_submission_date).toISOString().slice(0, 10)}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Type: </span>
                    <span>{deviation.type}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Deviation Description: </span>
                    <span>{deviation.deviation_description}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Rationale: </span>
                    <span>{deviation.rationale}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Impact: </span>
                    <span>{deviation.impact}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Suggested Corrective Action: </span>
                    <span>{deviation.corrective_action}</span>
                </div>
                <div className="mb-4">
                    <span className="font-semibold text-gray-700">Feedback/Review: </span>
                    <div className={`p-4 rounded-lg mt-1 whitespace-pre-line border-l-4 ${deviation.severity === 'Major' ? 'bg-red-50 border-red-400 text-red-700 font-semibold' : 'bg-blue-50 border-blue-300 text-gray-800'}`}>
                        {deviation.severity === 'Major'
                            ? (deviation.corrective_action_feedback || 'No corrective action feedback provided.')
                            : (deviation.review || 'No feedback provided.')}
                    </div>
                </div>
                {deviation.severity === 'Major' && (
                    <>
                        <div className="mb-4">
                            <span className="font-semibold text-gray-700">Required Changes: </span>
                            <span className="text-red-700 font-semibold">{deviation.corrective_action_required === 'changes' ? 'Changes required' : deviation.corrective_action_required === 'none' ? 'No changes required' : '-'}</span>
                        </div>
                        {deviation.corrective_action_details && (
                            <div className="mb-4">
                                <span className="font-semibold text-gray-700">Required Changes Details: </span>
                                <span className="text-red-700 font-semibold">{deviation.corrective_action_details}</span>
                            </div>
                        )}
                        <div className="mb-4">
                            <span className="font-semibold text-gray-700">Additional Documents: </span>
                            <span className="text-red-700 font-semibold">{deviation.corrective_action_docs === 'docs' ? 'Documents required' : deviation.corrective_action_docs === 'none' ? 'No documents required' : '-'}</span>
                        </div>
                        {deviation.corrective_action_docs_details && (
                            <div className="mb-4">
                                <span className="font-semibold text-gray-700">Additional Documents Details: </span>
                                <span className="text-red-700 font-semibold">{deviation.corrective_action_docs_details}</span>
                            </div>
                        )}
                        <div className="mb-4">
                            <span className="font-semibold text-gray-700">Return Deadline: </span>
                            <span className="text-red-700 font-semibold">{deviation.corrective_action_deadline ? new Date(deviation.corrective_action_deadline).toLocaleDateString() : '-'}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackDetail;
