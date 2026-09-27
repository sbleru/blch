import csvtojson from 'csvtojson'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Human } from "../types/index.js";

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const getHumanDataList = async (): Promise<Human[]> => {
  const filename = path.join(dirname, '..', 'data', 'human.csv')
  const dataList: Human[] = await csvtojson().fromFile(filename)
  return dataList
}
