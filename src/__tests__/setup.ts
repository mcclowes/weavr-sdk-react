import { vi } from 'vitest';

// Mock the Weavr client
const mockSecureInput = {
  mount: vi.fn(),
  unmount: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  focus: vi.fn(),
  blur: vi.fn(),
  clear: vi.fn(),
};

const mockSecureSpan = {
  mount: vi.fn(),
  unmount: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
};

const mockForm = {
  input: vi.fn(() => mockSecureInput),
  tokenize: vi.fn((cb) => cb({ password: 'tokenized-value' })),
  destroy: vi.fn(),
};

export const mockWeavrClient = {
  init: vi.fn(),
  associate: vi.fn((_token: string, onSuccess: () => void, _onError: (e: Error) => void) =>
    onSuccess()
  ),
  setUserToken: vi.fn((_token: string, onSuccess: () => void, _onError: (e: Error) => void) =>
    onSuccess()
  ),
  form: vi.fn(() => mockForm),
  kyb: vi.fn(() => ({
    init: vi.fn(),
  })),
  kyc: vi.fn(() => ({
    init: vi.fn(),
  })),
  consumer_kyc: vi.fn(() => ({
    init: vi.fn(),
  })),
  span: vi.fn(() => mockSecureSpan),
  display: {
    cardNumber: vi.fn(() => mockSecureSpan),
    cvv: vi.fn(() => mockSecureSpan),
    cardPin: vi.fn(() => mockSecureSpan),
  },
  capture: {
    password: vi.fn(() => mockSecureInput),
    passcode: vi.fn(() => mockSecureInput),
    cardPin: vi.fn(() => mockSecureInput),
  },
};

// Mock window.OpcUxSecureClient
Object.defineProperty(window, 'OpcUxSecureClient', {
  value: mockWeavrClient,
  writable: true,
});

export { mockSecureInput, mockSecureSpan, mockForm };
