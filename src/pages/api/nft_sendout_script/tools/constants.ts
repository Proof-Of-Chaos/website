export const TreasuryAccount = "F3opxRbN5ZbjJNU511Kj2TLuzFcDq9BGduA9TgiECafpg29";

export const ProposalState = Object.freeze({
  Proposed: "Proposed",
  ApproveVoting: "ApproveVoting",
  RejectVoting: "RejectVoting",
  Rejected: "Rejected",
  Approved: "Approved",
  Awarded: "Awarded",
});

export const TipEvents = Object.freeze({
  NewTip: "NewTip",
  TipClosing: "TipClosing",
  TipClosed: "TipClosed",
  TipRetracted: "TipRetracted",
  TipSlashed: "TipSlashed",
});

export const TipMethods = Object.freeze({
  tipNew: "tipNew",
  reportAwesome: "reportAwesome",
  retractTip: "retractTip",
  tip: "tip",
  closeTip: "closeTip",
});

export const SystemMethods = Object.freeze({
  remark: "remark",
});

export const ProposalEvents = Object.freeze({
  Proposed: "Proposed",
  Awarded: "Awarded",
  Rejected: "Rejected",
});

export const TreasuryProposalMethods = Object.freeze({
  proposeSpend: "proposeSpend",
  rejectProposal: "rejectProposal",
  approveProposal: "approveProposal",
});

export const TreasuryProposalEvents = Object.freeze({
  Proposed: "Proposed",
  Awarded: "Awarded",
  Rejected: "Rejected",
});

export const BountyEvents = Object.freeze({
  BountyProposed: "BountyProposed",
  BountyRejected: "BountyRejected",
  BountyBecameActive: "BountyBecameActive",
  BountyAwarded: "BountyAwarded",
  BountyClaimed: "BountyClaimed",
  BountyCanceled: "BountyCanceled",
  BountyExtended: "BountyExtended",
});

export const BountyStatus = Object.freeze({
  Proposed: "Proposed",
  Approved: "Approved",
  /// The bounty is funded and waiting for curator assignment.
  Funded: "Funded",
  /// A curator has been proposed by the `ApproveOrigin`. Waiting for acceptance from the
  /// curator.
  CuratorProposed: "CuratorProposed",
  /// The bounty is active and waiting to be awarded.
  Active: "Active",
  /// The bounty is awarded and waiting to released after a delay.
  PendingPayout: "PendingPayout",
  Rejected: "Rejected",
  Canceled: "Canceled",
  Claimed: "Claimed",
});

export const BountyMethods = Object.freeze({
  proposeBounty: "proposeBounty",
  approveBounty: "approveBounty",
  proposeCurator: "proposeCurator",
  unassignCurator: "unassignCurator",
  acceptCurator: "acceptCurator",
  awardBounty: "awardBounty",
  claimBounty: "claimBounty",
  closeBounty: "closeBounty",
  extendBountyExpiry: "extendBountyExpiry",
});

export const CouncilEvents = Object.freeze({
  Proposed: "Proposed",
  Voted: "Voted",
  Approved: "Approved",
  Disapproved: "Disapproved",
  Executed: "Executed",
  Closed: "Closed",
});

export const CouncilMethods = Object.freeze({
  propose: "propose",
  vote: "vote",
  close: "close",
});

export const MotionState = Object.freeze({
  ApproveVoting: "ApproveVoting",
  RejectVoting: "RejectVoting",
});

export const MotionActions = {
  Propose: "Propose",
  Vote: "Vote",
  Close: "Close",
};

export const Modules = Object.freeze({
  Treasury: "treasury",
  Council: "council",
  Proxy: "proxy",
  Multisig: "multisig",
  Utility: "utility",
  Tips: "tips",
  Bounties: "bounties",
  Staking: "staking",
  Identity: "identity",
  Democracy: "democracy",
  Referenda: "referenda",
  ElectionsPhragmen: "electionsPhragmen",
  PhragmenElection: "PhragmenElection",
  Session: "session",
  Balances: "balances",
  Sudo: "sudo",
});

export const BalancesEvents = Object.freeze({
  Transfer: "Transfer",
});

export const SessionEvents = Object.freeze({
  NewSession: "NewSession",
});

export const ElectionsPhragmenEvents = Object.freeze({
  CandidateSlashed: "CandidateSlashed",
  SeatHolderSlashed: "SeatHolderSlashed",
  NewTerm: "NewTerm",
});

export const DemocracyEvents = Object.freeze({
  Blacklisted: "Blacklisted",
  PreimageInvalid: "PreimageInvalid",
  PreimageNoted: "PreimageNoted",
  Proposed: "Proposed"
});

export const DemocracyMethods = Object.freeze({
  cancelProposal: "cancel_proposal",
  propose: "propose",
});

export const ReferendumMethods = Object.freeze({
  Started: "Started",
  Tabled: "Tabled",
  NotPassed: "NotPassed",
  Passed: "Passed"
});

export const OpenGovReferendumMethods = Object.freeze({
  Proposed: "Proposed",
  Confirmed: "Confirmed",
  Rejected: "Rejected",
  Canceled: "Canceled"
});

export const ProxyMethods = Object.freeze({
  proxy: "proxy",
});

export const TimelineItemTypes = Object.freeze({
  extrinsic: "extrinsic",
  event: "event",
});

export const IdentityEvents = Object.freeze({
  IdentityKilled: "IdentityKilled",
});

export const MultisigMethods = Object.freeze({
  asMulti: "asMulti",
});

export const UtilityMethods = Object.freeze({
  batch: "batch",
});

export const TreasuryEvent = Object.freeze({
  Burnt: "Burnt",
  Deposit: "Deposit",
  Rejected: "Rejected",
  BountyRejected: "BountyRejected",
});

export const TreasuryMethods = Object.freeze({
  unassignCurator: "unassign_curator",
});

export const StakingEvents = Object.freeze({
  EraPayout: "EraPayout",
  EraPaid: "EraPaid",
  Slash: "Slash",
  Slashed: "Slashed",
  Reward: "Reward",
});

export const SudoMethods = Object.freeze({
  sudo: "sudo",
});