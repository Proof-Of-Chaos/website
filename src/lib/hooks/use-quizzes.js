import useSWR from "swr";
//import { quizzes } from "../../data/vote-quiz";

// mock the quizzes api
const quizzesFetcher = async () => {
  const data = await fetch('https://gateway.ipfs.io/ipns/k2k4r8l0pjhpwtaaia4zch6tr1d2lvplkd0wn46xkob6mw93qniyh8c5')
  const config = await data.json()
  return config?.quizzes ?? {}
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
