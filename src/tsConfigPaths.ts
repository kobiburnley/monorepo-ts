import {writeFileSync} from "fs"
import {Package} from "./listPackages"
import * as path from "path"

export function tsConfigPaths(packages: Package[], project = "tsconfig.json") {
  const packageNameToPackage = new Map<string, Package>(
    packages.map(p => [p.json.name, p] as any)
  )

  packages.forEach(p => {
    const tsConfigPath = `${p.path}/${project}`
    const tsConfig = require(tsConfigPath)
    Object.assign(
      tsConfig.compilerOptions, {
        baseUrl: ".",
        paths: Object.keys(p.json.dependencies)
          .filter(k => packageNameToPackage.has(k))
          .map(k => packageNameToPackage.get(k) as Package)
          .reduce((previousValue, currentValue) => ({
            ...previousValue,
            [currentValue.json.name]: [path.relative(p.path, `${currentValue.path}/src/*`)]
          }), {})
      }
    )
    writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2))
  })
}
