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
  log(
    persist((set) => ({
      user: {
        quizAnswers: {},
        knowsAboutLuckBoost: false,
        connectedWalletProvider: null,
        connectedWallet: null,
        nfts: [],
      },
      updateUserNfts: ( nfts ) => {
        set((state)=>({
          user: {
            ...state.user,
            nfts,
          }
        }))
      },
      updateLuckBoostKnowledge: ( val ) => {
        set((state)=>({
          user: {
            ...state.user,
            knowsAboutLuckBoost: val,
          }
        }))
      },
      updateConnectedWalletProvider: ( walletProvider ) => {
        set((state)=>({
          user: {
            ...state.user,
            connectedWalletProvider: walletProvider,
          }
        }))
      },
      updateConnectedWallet: ( wallet ) => {
        set((state)=>({
          user: {
            ...state.user,
            connectedWallet: wallet,
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
      }),
      {
        name: 'govrewards-storage', // unique name
      }
    )
  )
)

export default useAppStore;