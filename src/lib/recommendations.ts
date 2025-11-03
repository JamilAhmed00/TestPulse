import { Student, University } from './supabase';

/**
 * Calculate match score (0-100%) for a university based on student profile
 */
export const calculateMatchScore = (student: Student, university: University): number => {
  let score = 0;
  const maxScore = 100;

  // 1. GPA/Marks compatibility (40 points)
  // Assume student has average marks - in real app, get from exam results
  const studentAvgMarks = student.hsc_marks || 70; // Default assumption
  const requiredMarks = getRequiredMarksForUniversity(university);
  
  if (studentAvgMarks >= requiredMarks) {
    score += 40; // Perfect match
  } else if (studentAvgMarks >= requiredMarks * 0.9) {
    score += 30; // Close match
  } else if (studentAvgMarks >= requiredMarks * 0.8) {
    score += 20; // Moderate match
  } else {
    score += 10; // Low match
  }

  // 2. Unit preference matching (20 points)
  // Check if university accepts the student's unit
  // This is simplified - in real app, check actual university requirements
  if (isUnitCompatible(student.unit, university)) {
    score += 20;
  } else {
    score += 5; // Some universities accept multiple units
  }

  // 3. Acceptance rate vs competitiveness (20 points)
  // Higher acceptance rate = better match for average students
  const acceptanceRate = university.acceptance_rate;
  if (acceptanceRate >= 30) {
    score += 20; // High acceptance rate = good match
  } else if (acceptanceRate >= 15) {
    score += 15; // Medium acceptance rate
  } else if (acceptanceRate >= 8) {
    score += 10; // Lower acceptance rate
  } else {
    score += 5; // Very competitive
  }

  // 4. Competition level matching (10 points)
  // Match student's competitiveness with university's competition level
  const competitionLevel = university.competition_level;
  const studentCompetitiveness = getStudentCompetitiveness(student);
  
  if (
    (studentCompetitiveness === 'High' && competitionLevel === 'Very High') ||
    (studentCompetitiveness === 'Medium' && competitionLevel === 'High') ||
    (studentCompetitiveness === 'Low' && competitionLevel === 'Medium')
  ) {
    score += 10; // Good match
  } else if (
    (studentCompetitiveness === 'Medium' && competitionLevel === 'Medium') ||
    (studentCompetitiveness === 'High' && competitionLevel === 'High')
  ) {
    score += 8; // Decent match
  } else {
    score += 5; // Less ideal match
  }

  // 5. Location preference (10 points)
  // If student is from same city, add bonus
  if (student.city && student.city.toLowerCase() === university.city.toLowerCase()) {
    score += 10;
  } else {
    score += 5; // Neutral
  }

  return Math.min(Math.round(score), maxScore);
};

/**
 * Get required marks for a university based on competition level
 */
const getRequiredMarksForUniversity = (university: University): number => {
  const competitionLevel = university.competition_level;
  
  switch (competitionLevel) {
    case 'Very High':
      return 75; // Very competitive universities
    case 'High':
      return 70;
    case 'Medium':
      return 65;
    case 'Low':
      return 60;
    default:
      return 65;
  }
};

/**
 * Check if student's unit is compatible with university
 */
const isUnitCompatible = (studentUnit: string, university: University): boolean => {
  // In real app, this would check actual university requirements
  // For now, assume all universities accept all units (simplified)
  // Some universities might have unit-specific requirements
  return true;
};

/**
 * Determine student's competitiveness level based on marks
 */
const getStudentCompetitiveness = (student: Student): 'Low' | 'Medium' | 'High' => {
  const marks = student.hsc_marks || 70;
  
  if (marks >= 75) return 'High';
  if (marks >= 65) return 'Medium';
  return 'Low';
};

/**
 * Get top recommended universities for a student
 */
export const getRecommendedUniversities = (
  student: Student,
  universities: University[],
  limit: number = 10
): Array<{ university: University; matchScore: number }> => {
  const scored = universities.map(uni => ({
    university: uni,
    matchScore: calculateMatchScore(student, uni),
  }));

  // Sort by match score (descending)
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
};

