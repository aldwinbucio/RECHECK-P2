export interface ResearcherDeviationReport {
  id: string;
  protocol_title: string;
  protocol_code: string;
  deviation_date: string;
  deviation_description: string;
  rationale: string;
  impact: string;
  corrective_action: string;
  supporting_documents: string[];
  reported_by: string;
  report_submission_date: string;
  type: string;
  status: string;
  severity?: string;
  review?: string; // Feedback from staff
  corrective_action_feedback?: string; // Feedback for major deviations
  corrective_action_required?: string;
  corrective_action_details?: string;
  corrective_action_docs?: string;
  corrective_action_docs_details?: string;
  corrective_action_deadline?: string;
}
