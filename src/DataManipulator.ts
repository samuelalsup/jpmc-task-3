import { ServerRespond } from './DataStreamer';

export interface Row {
    price_abc: number,
    price_def: number,
    timestamp: Date,
    ratio: number,
    upperBound: number,
    lowerBound: number,
    alert: number | undefined,
}
const pastRatios: Array<{ratio : number, timestamp: Date}> = []
let left : number = 0

export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    const price_abc = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2
    const price_def = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2
    const ratio = price_def ? (price_abc / price_def) : 0
    const timestamp = serverResponds[0].timestamp > serverResponds[1].timestamp ? serverResponds[0].timestamp : serverResponds[1].timestamp
    pastRatios.push({ratio, timestamp})
    while (new Date(pastRatios[pastRatios.length - 1].timestamp).getTime() - new Date(pastRatios[left].timestamp).getTime() > (1000 * 3600 * 24 *365)) {
      left += 1
      console.log(left)
    }
    let curSum = 0
    for (let i=left; i < pastRatios.length; i++) {
      curSum += pastRatios[i].ratio
    }
    const upperBound = (pastRatios.length - left) ? curSum / (pastRatios.length - left) * 1.1 : 1.05;
    const lowerBound = (pastRatios.length - left) ? curSum / (pastRatios.length - left) * 0.9 : 0.95;
      return {
        price_abc,
        price_def,
        ratio,
        timestamp,
        upperBound,
        lowerBound,
        alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
    }
  }
