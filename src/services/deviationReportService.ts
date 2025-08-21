import { supabase } from '../lib/supabase';

export async function submitDeviationReport(form) {
  const payload = {
    protocol_title: form.protocolTitle,
    protocol_code: form.protocolCode,
    deviation_date: form.deviationDate,
    deviation_description: form.deviationDescription,
    rationale: form.rationale,
    impact: form.impact,
    corrective_action: form.correctiveAction,
    supporting_documents: form.supportingDocuments || [],
    reported_by: form.reportedBy,
    report_submission_date: form.reportSubmissionDate,
    type: form.type, 
  };
  // Return inserted row for debugging
  const { data, error } = await supabase.from('deviation_reports').insert([payload]).select();
  return { data, error };
}
