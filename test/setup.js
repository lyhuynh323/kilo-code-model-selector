const mockVscode = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showQuickPick: jest.fn()
  },
  commands: {
    registerCommand: jest.fn(() => ({ dispose: jest.fn() }))
  },
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn(() => ({})),
      update: jest.fn(() => Promise.resolve())
    }))
  },
  ConfigurationTarget: {
    Global: 1
  }
};

jest.mock('vscode', () => mockVscode, { virtual: true });
jest.mock('https', () => ({}));

global.mockVscode = mockVscode;