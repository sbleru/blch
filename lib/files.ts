import * as csvtojson from 'csvtojson'
import { Human } from "../types";

export const getHumanDataList = async (): Promise<Human[]> => {
  const filename = __dirname + '/../data/human.csv'
  const dataList: Human[] = await csvtojson().fromFile(filename)
  return dataList
}
