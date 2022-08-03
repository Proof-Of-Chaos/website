import useSWR from "swr";
import create from "zustand";
import { persist } from 'zustand/middleware'
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

const useAppStore = create(
  log(persist((set) => ({
    user: {
      quizAnswers: {},
      knowsAboutLuckBoost: false,
    },
    updateLuckBoostKnowledge: ( val ) => {
      set((state)=>({
        user: {
          ...state.user,
          knowsAboutLuckBoost: val,
        }
      }))
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
  })),     {
    name: 'app-storage', // unique name
  })
)

export default useAppStore;