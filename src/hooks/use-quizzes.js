import { useQuery } from "@tanstack/react-query";
import { websiteConfig } from "../data/website-config";

const quizzesFetcher = async () => {
  // const data = await fetch('https://gateway.ipfs.io/ipns/k2k4r8l0pjhpwtaaia4zch6tr1d2lvplkd0wn46xkob6mw93qniyh8c5')
  // const config = await data.json()
  return websiteConfig.quizzes
};

export const useQuizzes = () => {
  return useQuery( ['quizzes'], quizzesFetcher )
};
