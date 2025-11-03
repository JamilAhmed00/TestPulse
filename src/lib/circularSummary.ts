/**
 * Auto-generates a summary from university admission circular text
 * Extracts key information: deadline, eligibility, required documents, exam date
 */

export interface CircularSummary {
  deadline: string;
  eligibility: string;
  requiredDocuments: string[];
  examDate: string | null;
  importantNotes: string[];
}

export const generateCircularSummary = (circularText: string): CircularSummary => {
  // Mock implementation - in real app, this would use NLP/AI to extract information
  // For now, we'll create structured summaries based on keywords and patterns
  
  const text = circularText.toLowerCase();
  
  // Extract deadline (look for date patterns)
  const deadlineMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(deadline.*?(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}))/i);
  const deadline = deadlineMatch ? deadlineMatch[0] : 'Not specified';
  
  // Extract exam date
  const examDateMatch = text.match(/(exam.*?date.*?(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}))|(admission.*?test.*?(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}))/i);
  const examDate = examDateMatch ? examDateMatch[0] : null;
  
  // Extract eligibility criteria
  let eligibility = 'HSC passed students';
  if (text.includes('gpa') || text.includes('cgpa')) {
    const gpaMatch = text.match(/(gpa|cgpa).*?(\d+\.?\d*)/i);
    if (gpaMatch) {
      eligibility = `Minimum GPA: ${gpaMatch[2]}`;
    }
  }
  if (text.includes('ssc') && text.includes('hsc')) {
    eligibility += ' with SSC and HSC certificates';
  }
  
  // Extract required documents
  const documents: string[] = [];
  const documentKeywords = [
    'ssc certificate',
    'hsc certificate',
    'photo',
    'passport size photo',
    'national id',
    'birth certificate',
    'character certificate',
    'medical certificate',
  ];
  
  documentKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      documents.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  // Default documents if none found
  if (documents.length === 0) {
    documents.push('SSC Certificate', 'HSC Certificate', 'Passport Size Photo', 'National ID Card');
  }
  
  // Extract important notes
  const notes: string[] = [];
  if (text.includes('online application')) {
    notes.push('Online application available');
  }
  if (text.includes('fee')) {
    notes.push('Application fee required');
  }
  if (text.includes('exam')) {
    notes.push('Admission test required');
  }
  if (text.includes('merit')) {
    notes.push('Selection based on merit');
  }
  
  return {
    deadline,
    eligibility,
    requiredDocuments: documents,
    examDate,
    importantNotes: notes.length > 0 ? notes : ['Follow official guidelines'],
  };
};

/**
 * Generates a human-readable summary text from circular summary object
 */
export const formatCircularSummary = (summary: CircularSummary): string => {
  const parts: string[] = [];
  
  parts.push(`Deadline: ${summary.deadline}`);
  parts.push(`Eligibility: ${summary.eligibility}`);
  
  if (summary.examDate) {
    parts.push(`Exam Date: ${summary.examDate}`);
  }
  
  if (summary.requiredDocuments.length > 0) {
    parts.push(`Required Documents: ${summary.requiredDocuments.join(', ')}`);
  }
  
  if (summary.importantNotes.length > 0) {
    parts.push(`Notes: ${summary.importantNotes.join(', ')}`);
  }
  
  return parts.join(' | ');
};

