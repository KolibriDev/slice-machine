import {
  jest,
  describe,
  afterEach,
  test,
  expect,
  beforeEach,
} from "@jest/globals";
import * as Core from "@slicemachine/core";
import { configureProject } from "../src/steps";

type SpinnerReturnType = ReturnType<typeof Core.Utils.spinner>;

const startFn = jest.fn<SpinnerReturnType, string[]>();
const successFn = jest.fn<SpinnerReturnType, string[]>();
const failFn = jest.fn<SpinnerReturnType, string[]>();

jest.mock("@slicemachine/core", () => {
  const actualCore = jest.requireActual("@slicemachine/core") as typeof Core;

  return {
    ...actualCore,
    FileSystem: {
      ...actualCore.FileSystem,
      retrieveManifest: jest.fn<
        Core.FileSystem.FileContent<Core.FileSystem.Manifest>,
        [{ cwd: string }]
      >(),
      createManifest: jest.fn<
        void,
        [{ cwd: string; manifest: Core.FileSystem.Manifest }]
      >(),
      patchManifest: jest.fn<
        boolean,
        [{ cwd: string; data: Partial<Core.FileSystem.Manifest> }]
      >(),
      addJsonPackageSmScript: jest.fn<boolean, [{ cwd: string }]>(),
    },
    Utils: {
      ...actualCore.Utils,
      spinner: () => ({
        start: startFn,
        succeed: successFn,
        fail: failFn,
      }),
    },
  };
});

describe("configure-project", () => {
  void beforeEach(() => {
    jest.spyOn(process, "exit").mockImplementation((number) => number as never);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  const fakeCwd = "./";
  const fakeBase = "https://music.to.my.hears.io" as Core.Utils.Endpoints.Base;
  const fakeRepository = "testing-repo";
  const fakeFrameworkStats = {
    value: Core.Utils.Framework.FrameworkEnum.react,
    manuallyAdded: false,
  };

  const retrieveManifestMock = Core.FileSystem.retrieveManifest as jest.Mock;
  const createManifestMock = Core.FileSystem.createManifest as jest.Mock;
  const patchManifestMock = Core.FileSystem.patchManifest as jest.Mock;
  const addJsonPackageSmScriptMock = Core.FileSystem
    .addJsonPackageSmScript as jest.Mock;

  test("it should create a new manifest if it doesn't exist yet", () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });

  test("it should patch the existing manifest", () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Core.Utils.Framework.FrameworkEnum.react,
      },
    });
    addJsonPackageSmScriptMock.mockReturnValue(true);

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).toBeCalled();

    expect(successFn).toHaveBeenCalled();
    expect(failFn).not.toHaveBeenCalled();
  });

  test("it should fail if retrieve manifest throws", () => {
    retrieveManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    // process.exit should throw
    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });

  test("it should fail if create manifest throws", () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    createManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });

  test("it should fail if patch manifest throws", () => {
    retrieveManifestMock.mockReturnValue({
      exists: true,
      content: {
        framework: Core.Utils.Framework.FrameworkEnum.react,
      },
    });
    patchManifestMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).not.toBeCalled();
    expect(patchManifestMock).toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });

  test("it should fail if add SM script throws", () => {
    retrieveManifestMock.mockReturnValue({
      exists: false,
      content: null,
    });
    createManifestMock.mockReturnValue(null); // we don't care about this void.
    addJsonPackageSmScriptMock.mockImplementation(() => {
      throw new Error("fake error to test the catch");
    });

    configureProject(fakeCwd, fakeBase, fakeRepository, fakeFrameworkStats);

    expect(retrieveManifestMock).toBeCalled();
    expect(createManifestMock).toBeCalled();
    expect(patchManifestMock).not.toBeCalled();

    expect(successFn).not.toHaveBeenCalled();
    expect(failFn).toHaveBeenCalled();
  });
});
