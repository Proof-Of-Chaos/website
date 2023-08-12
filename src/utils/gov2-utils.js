import {
  bnMax,
  bnMin,
  bnToBn,
  BN_BILLION,
  BN_HUNDRED,
  BN_MILLION,
  BN_THOUSAND,
  isBn,
  BN,
} from "@polkadot/util";
import { isNil } from "lodash";

/**
 * from https://github.com/polkadot-js/apps/blob/bf69fbb625b8d0b585fbe8c40e1b91b939497135/packages/page-referenda/src/util.ts
 * @param {} curve
 * @param {*} input
 * @param {*} div
 * @returns
 */
export function curveThreshold(curve, input, div = bnToBn(1000)) {
  // if divisor is zero, we return the max
  if (div.isZero()) {
    return BN_BILLION;
  }

  if (!curve) {
    return BN_BILLION;
  }

  const x = bnToBn(input).mul(BN_BILLION).div(div);

  if (curve?.linearDecreasing) {
    let { ceil, floor, length } = curve.linearDecreasing;

    ceil = bnToBn(ceil);
    floor = bnToBn(floor);
    length = bnToBn(length);

    // *ceil - (x.min(*length).saturating_div(*length, Down) * (*ceil - *floor))
    // NOTE: We first multiply, then divide (since we work with fractions)
    return ceil.sub(bnMin(x, length).mul(ceil.sub(floor)).div(length));
  } else if (curve?.isSteppedDecreasing) {
    const { begin, end, period, step } = curve.asSteppedDecreasing;

    // (*begin - (step.int_mul(x.int_div(*period))).min(*begin)).max(*end)
    return bnMax(end, begin.sub(bnMin(begin, step.mul(x).div(period))));
  } else if (curve?.reciprocal) {
    let { factor, xOffset, yOffset } = curve.reciprocal;
    factor = bnToBn(factor);
    xOffset = bnToBn(xOffset);
    yOffset = bnToBn(yOffset);

    // factor
    //   .checked_rounding_div(FixedI64::from(x) + *x_offset, Low)
    //   .map(|yp| (yp + *y_offset).into_clamped_perthing())
    //   .unwrap_or_else(Perbill::one)
    return bnMin(
      BN_BILLION,
      factor.mul(BN_BILLION).div(x.add(xOffset)).add(yOffset)
    );
  }

  throw new Error(`Unknown curve found ${JSON.stringify(curve)}`);
}

//
/**
 * return the percentage (0 <= percentage <= 1) of the total period already passed
 * @param {*} totalPeriod The period in blocks, that something will last
 * @param {*} decidingSince The start of the current period (blockNumber)
 * @param {*} currentBlock The current block number
 */
export function getPercentagePassed(total, since, currentBlock) {
  if (isNil(since) || isNil(total) || isNil(currentBlock)) {
    return null;
  }

  const passedBlocks = currentBlock - since;
  return Math.min(passedBlocks / total, 1);
}
