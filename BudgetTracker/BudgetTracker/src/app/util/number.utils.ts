import BigNumber from "bignumber.js";

export class NumberUtils {
  static format(number: BigNumber | null | undefined): string {
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
    let bigNum1 = new BigNumber(num1);
    let bigNum2 = new BigNumber(num2);

    if (bigNum1.gte(0) && bigNum2.gte(0)) {
      result = bigNum1.minus(bigNum2);
    }

    return new BigNumber(result);
  }
}
