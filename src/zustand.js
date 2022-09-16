import create from "zustand";
import { persist } from 'zustand/middleware'

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
  // log(
    persist((set) => ({
      user: {
        quizAnswers: {},
        knowsAboutLuckBoost: false,
        connectedWalletProvider: null,
        connectedWallet: null,
        connectedAccount: null,
        nfts: [],
      },
      setReferendums: ( referendums ) => {
        set(()=>({
          referendums,
        }))
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
      updateConnectedAccounts: ( accounts ) => {
        set((state)=>({
          user: {
            ...state.user,
            connectedAccounts: accounts,
          }
        }))
      },
      updateConnectedAccount: ( index ) => {
        set((state)=>({
          user: {
            ...state.user,
            connectedAccount: index,
          }
        }))
      },
      submitQuiz: ( referendumId ) => {
        // store in state that user submitted quiz answers,
        // should only be called in the signAndSend
        set((state)=>({
          user: {
            ...state.user,
            quizAnswers: {
              ...state.user.quizAnswers,
              [`${referendumId}`]: {
                ...state.user.quizAnswers[`${referendumId}`],
                submitted: true,
                submittedOn: Date.now(),
              },
            }
          }
        }))
      },
      updateQuizAnswers: ( referendumId, answer ) =>
        set((state) => ({
          user: {
            ...state.user,
            quizAnswers: {
              ...state.user.quizAnswers,
              [`${referendumId}`]: {
                answers: {
                  ...state.user.quizAnswers[`${referendumId}`]?.answers,
                  ...answer,
                },
                lastChange: Date.now(),
              },
            }
          }
        }))
      }),
      {
        name: 'govrewards-storage', // unique name
      }
    )
  // )
)

export default useAppStore;