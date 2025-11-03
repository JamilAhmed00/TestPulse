import { Student, University, Application } from './supabase';

/**
 * Calculate success probability (0-100%) for admission to a university
 */
export const calculateSuccessProbability = (
  student: Student,
  university: University,
  application?: Application
): number => {
  let probability = 0;

  // 1. Marks comparison (50 points)
  const studentMarks = application?.marks_obtained || student.hsc_marks || 70;
  const requiredMarks = application?.marks_required || getRequiredMarksForUniversity(university);
  
  if (studentMarks >= requiredMarks) {
    probability += 50; // Excellent chance
  } else {
    const marksDifference = studentMarks - requiredMarks;
    if (marksDifference >= -5) {
      probability += 40; // Close to requirement
    } else if (marksDifference >= -10) {
      probability += 30; // Somewhat close
    } else if (marksDifference >= -15) {
      probability += 20; // Below requirement
    } else {
      probability += 10; // Far below requirement
    }
  }

  // 2. Acceptance rate factor (30 points)
  const acceptanceRate = university.acceptance_rate;
  probability += (acceptanceRate / 100) * 30; // Direct correlation

  // 3. Competition level factor (20 points)
  const competitionLevel = university.competition_level;
  let competitionMultiplier = 1;
  
  switch (competitionLevel) {
    case 'Very High':
      competitionMultiplier = 0.5; // Reduce probability significantly
      break;
    case 'High':
      competitionMultiplier = 0.7;
      break;
    case 'Medium':
      competitionMultiplier = 0.9;
      break;
    case 'Low':
      competitionMultiplier = 1.0;
      break;
  }

  probability *= competitionMultiplier;

  // 4. Historical success data (if available) - simplified
  // In real app, this would use actual historical acceptance data
  const historicalBonus = getHistoricalBonus(university, studentMarks);
  probability += historicalBonus;

  // Ensure probability is between 0 and 100
  probability = Math.max(0, Math.min(100, Math.round(probability)));

  return probability;
};

/**
 * Get required marks for a university based on competition level
 */
const getRequiredMarksForUniversity = (university: University): number => {
  const competitionLevel = university.competition_level;
  
  switch (competitionLevel) {
    case 'Very High':
      return 75;
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
 * Get historical bonus based on past acceptance patterns
 */
const getHistoricalBonus = (university: University, studentMarks: number): number => {
  // Simplified historical analysis
  // In real app, this would analyze actual historical data
  
  const avgAcceptedMarks = getAverageAcceptedMarks(university);
  
  if (studentMarks >= avgAcceptedMarks) {
    return 5; // Above average accepted marks
  } else if (studentMarks >= avgAcceptedMarks * 0.95) {
    return 2; // Close to average
  } else {
    return -2; // Below average
  }
};

/**
 * Get average accepted marks for a university (mock data)
 */
const getAverageAcceptedMarks = (university: University): number => {
  // Mock average accepted marks based on competition level
  switch (university.competition_level) {
    case 'Very High':
      return 80;
    case 'High':
      return 75;
    case 'Medium':
      return 70;
    case 'Low':
      return 65;
    default:
      return 70;
  }
};

/**
 * Get probability level (Low, Medium, High) for UI display
 */
export const getProbabilityLevel = (probability: number): 'Low' | 'Medium' | 'High' => {
  if (probability >= 70) return 'High';
  if (probability >= 40) return 'Medium';
  return 'Low';
};

/**
 * Get color for probability indicator
 */
export const getProbabilityColor = (probability: number): string => {
  if (probability >= 70) return 'green';
  if (probability >= 40) return 'yellow';
  return 'red';
};

