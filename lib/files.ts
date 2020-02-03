import * as fs from 'fs';
import * as path from 'path';

/**
 * dirname is gotei13|other|visored|other
 */
export const getFileNames = (searchDir = null, targetDirName = 'pages') => {

  // if searchDir = null, root directory 'pages'
  const baseDir = searchDir || 'pages'
  const dir = path.join(__dirname + '/../', baseDir)
  const names = []
  fs.readdirSync(dir).forEach((name) => {
    const fullName = path.join(dir, name)
    const stats = fs.statSync(fullName)
    const parse = path.parse(name)
    if (stats.isFile()) {
      names.push(parse.name)
    } else {
      const nextDir = `${baseDir}/${parse.name}`
      if (nextDir.includes(targetDirName)) {
        names.push.apply(names, getFileNames(nextDir, targetDirName));
      }
    }
  })
  return names
}

/**
 * return target file path if find out
 */
export const getFilePath = (searchDir = null, searchFile) => {

  // if searchDir = null, root directory 'pages'
  const baseDir = searchDir || 'pages'
  const dir = path.join(__dirname + '/../', baseDir)
  let target = null
  for (const name of fs.readdirSync(dir)) {
    const fullName = path.join(dir, name)
    const stats = fs.statSync(fullName)
    const parse = path.parse(name)
    if (stats.isFile() && searchFile === parse.name) {
      target = fullName
      break
    } else if (!stats.isFile()) {
      const nextDir = `${baseDir}/${parse.name}`
      target = getFilePath(nextDir, searchFile)
      if (target) {
        break
      }
    }
  }
  return target
}
