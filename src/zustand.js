import useSWR from "swr";
import create from "zustand";
import { getQuizById, getQuizzes } from "./data/vote-service";

const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  applying', args)
      set(...args)
      console.log('  new state', get())
    },
    get,
    api
  )

const useBeeStore = create(
  log((set) => ({
    bees: false,
    setBees: (input) => set({ bees: input }),
  }))
)

const useAppStore = create(
  log((set) => ({
    user: {
      quizAnswers: {},
    },
    updateQuiz: ( referendumId, answer ) =>
      set((state) => ({
        user: {
          ...state.user,
          quizAnswers: {
            ...state.user.quizAnswers,
            [`${referendumId}`]: {
              ...state.user.quizAnswers[`${referendumId}`],
              timestamp: Date.now(),
              ...answer,
            },
          }
        }
      }))
  }))
)

export default useAppStore;