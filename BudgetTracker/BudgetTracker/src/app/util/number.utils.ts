import BigNumber from "bignumber.js";

export class NumberUtils {
  static format(number: BigNumber | null | undefined) {

    const formatter = {
      decimalSeparator: '.',
      groupSeparator: ' ',
      groupSize: 3,
      secondaryGroupSize: 2
    }
    if (number) {
      const bigNum = new BigNumber(number);
      return bigNum.toFormat(2, formatter);
    }
    return '0.00';
  }
}
