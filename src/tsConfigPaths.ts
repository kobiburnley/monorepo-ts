import {writeFileSync} from "fs"
import {Package} from "./listPackages"

export function tsConfigPaths(packages: Package[]) {
  const packageNameToPackage = new Map<string, Package>(
    packages.map(p => [p.json.name, p] as any)
  )

  packages.forEach(p => {
    const tsConfigPath = `${p.path}/tsconfig.json`
    const tsConfig = require(tsConfigPath)
    Object.assign(
      tsConfig.compilerOptions, {
        baseUrl: ".",
        paths: Object.keys(p.json.dependencies)
          .filter(k => packageNameToPackage.has(k))
          .map(k => packageNameToPackage.get(k) as Package)
          .reduce((previousValue, currentValue) => ({...previousValue, [currentValue.json.name]: [`${currentValue.relativePath}/src`]}), {})
      }
    )
    writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2))
  })
}
