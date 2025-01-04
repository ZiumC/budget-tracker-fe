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

  static subtract(num1: BigNumber, num2: BigNumber): BigNumber {
    let result = new BigNumber(0);

    if (num1 && num2) {
      result = new BigNumber(num1).minus(new BigNumber(num2));
    }

    return new BigNumber(result);
  }
}
