import fs from "fs";
import path from "path";
import slash from "slash";

import Files from "../utils/files";
import { getInfoFromPath } from "../utils/lib";
import { getComponentInfo } from "./component";
import { Library, Component } from "../models/Library";

export async function handleLibraryPath(
  cwd: string,
  libPath: string
): Promise<Library | undefined> {
  const { from, isLocal, pathExists, pathToSlices } = getInfoFromPath(
    libPath,
    cwd
  );

  if (!pathExists) {
    return;
  }

  // all paths to components found in slices folder
  const pathsToComponents = Files.readDirectory(slash(pathToSlices))
    .map((curr) => path.join(pathToSlices, curr))
    .filter((e) => {
      const f = e.split(path.sep).pop();
      return fs.lstatSync(e).isDirectory() && !f?.startsWith(".");
    });

  // relative path to slice folder, to be appended with sliceName
  const pathToSlice = `${isLocal ? "./" : ""}${from}${pathToSlices
    .split(from)
    .slice(1)
    .join("")}`;

  const allComponents: Component[] = pathsToComponents.reduce(
    (acc: Component[], curr: string) => {
      const componentInfo = getComponentInfo(curr, { cwd, from });
      if (!componentInfo) {
        return acc;
      }
      const { model } = componentInfo;
      return [
        ...acc,
        {
          from,
          href: from.replace(/\//g, "--"),
          pathToSlice,
          infos: componentInfo,
          model,
          migrated: false,
        },
      ];
    },
    []
  );

  return {
    isLocal,
    name: from,
    components: allComponents,
  };
}

export async function libraries(cwd: string, libraries: string[]): Promise<ReadonlyArray<Library>> {
  const payload = await Promise.all(
    (libraries || []).map(
      async (lib) => await handleLibraryPath(cwd, lib)
    )
  );

  return payload.filter(Boolean) as ReadonlyArray<Library>;
}
