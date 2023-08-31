import { create } from "zustand";
import { persist } from "zustand/middleware";

const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      // console.log("  applying", args)
      set(...args);
      console.log("  new state", get());
    },
    get,
    api
  );

const initialState = {
  user: {
    quizAnswers: {},
    knowsAboutLuckBoost: false,
    connectedWalletProvider: null,
    connectedWallet: null,
    connectedAccount: null,
    nfts: [],
    voteStates: [],
  },
  chain: {
    currentBlock: null,
  },
};

const useAppStore = create(
  // log(
  persist(
    (set) => ({
      ...initialState,
      setCurrentBlock: (blockNumber) => {
        set(() => ({
          chain: {
            currentBlock: blockNumber,
          },
        }));
      },
      setReferendums: (referendums) => {
        set(() => ({
          referendums,
        }));
      },
      updateUserNfts: (nfts) => {
        set((state) => ({
          user: {
            ...state.user,
            nfts,
          },
        }));
      },
      updateLuckBoostKnowledge: (val) => {
        set((state) => ({
          user: {
            ...state.user,
            knowsAboutLuckBoost: val,
          },
        }));
      },
      updateConnectedWalletProvider: (walletProvider) => {
        set((state) => ({
          user: {
            ...state.user,
            connectedWalletProvider: walletProvider,
          },
        }));
      },
      updateConnectedAccounts: (accounts) => {
        set((state) => ({
          user: {
            ...state.user,
            connectedAccounts: accounts,
          },
        }));
      },
      updateConnectedAccount: (index) => {
        set((state) => ({
          user: {
            ...state.user,
            connectedAccount: index,
          },
        }));
      },
      updateVoteState: (referendumId, vote) => {
        set((state) => ({
          user: {
            ...state.user,
            voteStates: {
              ...state.user.voteStates,
              [`${referendumId}`]: {
                ...state.user.voteStates?.[`${referendumId}`],
                vote,
              },
            },
          },
        }));
      },
      removeVoteState: (referendumId) => {
        set((state) => {
          const newVoteStates = { ...state.user.voteStates };
          delete newVoteStates[`${referendumId}`];
          return {
            user: {
              ...state.user,
              voteStates: newVoteStates,
            },
          };
        });
      },
      clearVoteState: () => {
        set((state) => ({
          user: {
            ...state.user,
            voteStates: [],
          },
        }));
      },
      submitQuiz: (referendumId) => {
        // store in state that user submitted quiz answers,
        // should only be called in the signAndSend
        set((state) => ({
          user: {
            ...state.user,
            quizAnswers: {
              ...state.user.quizAnswers,
              [`${referendumId}`]: {
                ...state.user.quizAnswers[`${referendumId}`],
                submitted: true,
                submittedOn: Date.now(),
              },
            },
          },
        }));
      },
      updateQuizAnswers: (referendumId, answer) =>
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
            },
          },
        })),
    }),
    {
      name: "govrewards-storage", // unique name
    }
  )
  // )
);

export default useAppStore;
