import jsPDF from 'jspdf';
import { Student, University, Application } from './supabase';

/**
 * Generates a PDF admission card for a student's university application
 */
export const generateAdmissionCard = (
  student: Student,
  university: University,
  application: Application
): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 152, 219]; // Light Blue
  const textColor = [44, 62, 80]; // Dark Gray

  // Header with university name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(university.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Admission Card', 105, 30, { align: 'center' });

  // Photo placeholder box
  doc.setDrawColor(...textColor);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(160, 50, 35, 45, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(...textColor);
  doc.text('Photo', 177.5, 75, { align: 'center' });

  // Student Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('Student Information', 20, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoLines = [
    [`Name: ${student.first_name} ${student.last_name}`, 55],
    [`Father's Name: ${student.father_name}`, 62],
    [`Mother's Name: ${student.mother_name}`, 69],
    [`Email: ${student.email}`, 76],
    [`Mobile: ${student.mobile_number}`, 83],
    [`Address: ${student.address}, ${student.city}`, 90],
  ];

  infoLines.forEach(([text, y]) => {
    doc.text(text, 20, y);
  });

  // Application Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Application Details', 20, 105);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const appDetails = [
    [`Application ID: ${application.id.slice(0, 8).toUpperCase()}`, 112],
    [`Transaction ID: ${application.transaction_id || 'N/A'}`, 119],
    [`University: ${university.name}`, 126],
    [`Unit: ${student.unit}`, 133],
    [`Application Fee: ৳${university.application_fee}`, 140],
    [`Status: ${application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}`, 147],
  ];

  appDetails.forEach(([text, y]) => {
    doc.text(text, 20, y);
  });

  // Academic Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Information', 20, 160);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const academicInfo = [
    [`SSC: ${student.ssc_roll} (${student.ssc_year}) - ${student.ssc_board} Board`, 167],
    [`HSC: ${student.hsc_roll} (${student.hsc_year}) - ${student.hsc_board} Board`, 174],
    [`HSC Registration: ${student.hsc_registration_number}`, 181],
    [`SSC Marks: ${student.ssc_marks}`, 188],
    [`HSC Marks: ${student.hsc_marks}`, 195],
  ];

  academicInfo.forEach(([text, y]) => {
    doc.text(text, 20, y);
  });

  // Important Notes
  doc.setFillColor(255, 248, 220); // Light yellow
  doc.roundedRect(20, 205, 170, 35, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('Important Notes', 30, 215);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const notes = [
    '• Keep this admission card safe. You will need it for the admission test.',
    '• Bring a printed copy of this card and valid ID to the examination center.',
    '• Application fee is non-refundable.',
    '• For any queries, contact the university admission office.',
  ];
  
  notes.forEach((note, index) => {
    doc.text(note, 25, 222 + index * 5);
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const footerText = `Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })} | TestPulse Admission System`;
  doc.text(footerText, 105, 285, { align: 'center' });

  // Generate blob URL for download
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  return url;
};

/**
 * Downloads the admission card PDF
 */
export const downloadAdmissionCard = (
  student: Student,
  university: University,
  application: Application
): void => {
  const url = generateAdmissionCard(student, university, application);
  const link = document.createElement('a');
  link.href = url;
  link.download = `admission-card-${university.name.replace(/\s+/g, '-').toLowerCase()}-${application.id.slice(0, 8)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

