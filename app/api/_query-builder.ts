export const buildGetConvictionVotesForReferendumQuery = (
    refId: string,
    first: number | null,
    last: number | null,
    beforeBlock: string,
    afterBlock: string,
    onlyDelegate: boolean | null,
    onlyCasting: boolean | null
): string => {
    // Check constraints
    if ((first !== null && last !== null) || (first === null && last === null)) {
        throw new Error("Either 'last' or 'first' must be set, but not both.");
    }

    if ((onlyDelegate !== null && onlyCasting !== null) || (onlyDelegate === null && onlyCasting === null)) {
        throw new Error("Either 'onlyDelegate' or 'onlyDirect' must be set, but not both.");
    }

    // Construct the castingVotings query part
    let castingVotingsPart = `castingVotings(after: "${afterBlock}", before: "${beforeBlock}", `;
    castingVotingsPart += first !== null ? `first: ${first}, ` : `last: ${last}, `;
    castingVotingsPart += "orderBy: AT_ASC) {";
    castingVotingsPart += `
        edges {
            node {
                id
                splitAbstainVote
                splitVote
                standardVote
                voter
                delegateId
                delegatorVotes {
                    aggregates {
                        keys
                    }
                }
            }
        }
    }`;

    // Construct the delegatesByCastingVotingReferendumIdAndDelegateId query part (if needed)
    let delegatesPart = "";
    if (onlyDelegate) {
        delegatesPart = `
        delegatesByCastingVotingReferendumIdAndDelegateId {
            edges {
                node {
                    id
                    delegatorVotes
                    delegators
                    accountId
                    delegations {
                        edges {
                            node {
                                delegator
                                trackId
                                delegation
                                delegateId
                            }
                        }
                    }
                }
            }
        }`;
    }

    const query = `{
        referendum(id: "${refId}") {
            ${castingVotingsPart}
            ${delegatesPart}
        }
    }`;

    return query;
}
