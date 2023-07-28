const cli = require('cli-color');
function calculateQuartilesAndMinMax(inputArray) {
  const sortedArray = inputArray.slice().sort((a, b) => a - b);

  const calculateMedian = (arr) => {
    const middleIndex = Math.floor(arr.length / 2);
    if (arr.length % 2 === 0) {
      return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
    } else {
      return arr[middleIndex];
    }
  };

  const q1Index = Math.floor(sortedArray.length / 4);
  const q1 = calculateMedian(sortedArray.slice(0, q1Index));
  const q3Index = Math.floor((3 * sortedArray.length) / 4);
  const q3 = calculateMedian(sortedArray.slice(q3Index));
  const min = sortedArray[0];
  const max = sortedArray[sortedArray.length - 1];
  return { sortedArray, q1, q2: calculateMedian(sortedArray), q3, min, max };
}

const a = [14, 6, 21, 19, 2, 28, 11, 34, 30, 16, 25, 31, 7];

const result = calculateQuartilesAndMinMax(a);
console.log(`${cli.bgCyan.black('Sorted >')} ${cli.cyan(result.sortedArray.join(', '))}`);
console.log(`${cli.bgCyan.black('Minimum >')} ${cli.cyan(result.min)}`);
console.log(`${cli.bgCyan.black('Q1 >')} ${cli.cyan(result.q1)}`);
console.log(`${cli.bgCyan.black('Q2 (Median) >')} ${cli.cyan(result.q2)}`);
console.log(`${cli.bgCyan.black('Q3 >')} ${cli.cyan(result.q3)}`);
console.log(`${cli.bgCyan.black('Maximum >')} ${cli.cyan(result.max)}`);
console.log(`${cli.bgCyan.black('IQR >')} ${cli.cyan(result.q3 - result.q1)}`);
