import type {
  SatisfactionSurvey,
  SurveyResponse,
} from "../satisfaction-types";

export const getLikertConvertedScore = (
  responses: SurveyResponse[],
  questionsCount: number,
): number => {
  if (!responses || responses.length === 0 || questionsCount === 0) return 0;

  let totalScore = 0;
  let totalItems = 0;

  responses.forEach((response) => {
    response.scores.forEach((score) => {
      totalScore += score * 20;
      totalItems++;
    });
  });

  return parseFloat((totalScore / totalItems).toFixed(1));
};

export const getQuestionAverageScores = (survey: SatisfactionSurvey) => {
  if (!survey.responses || survey.responses.length === 0) {
    return survey.questions.map((_, index) => ({
      name: `문항 ${index + 1}`,
      score: 0,
    }));
  }

  return survey.questions.map((question, index) => {
    let sum = 0;
    survey.responses.forEach((response) => {
      sum += (response.scores[index] || 0) * 20;
    });
    return {
      name: `문항 ${index + 1}`,
      score: parseFloat((sum / survey.responses.length).toFixed(1)),
      questionText: question,
    };
  });
};
