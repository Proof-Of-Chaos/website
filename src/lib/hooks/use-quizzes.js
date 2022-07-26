import useSWR from "swr";
import { quizzes } from "../../data/vote-quiz";

// mock the quizzes api
const quizzesFetcher = async () => {
  await new Promise(res => setTimeout(res, 1000));
  return quizzes
};

export const useQuizzes = () => {
  const { data, mutate, error } = useSWR( 'quizzes', quizzesFetcher )
  const loading = !data && !error;

  return {
    loading,
    quizzes: data,
    mutate,
    error,
  };
};
