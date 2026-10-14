import type { SecureClient, InitOptions } from './types';

const SANDBOX_SCRIPT_URL = 'https://sandbox.weavr.io/app/secure/static/client.1.js';
const PRODUCTION_SCRIPT_URL = 'https://secure.weavr.io/app/secure/static/client.1.js';

export type WeavrEnvironment = 'sandbox' | 'production';

export const DEFAULT_WEAVR_TIMEOUT_MS = 15_000;

interface LoadScriptOptions {
  environment?: WeavrEnvironment;
  customScriptUrl?: string;
  timeoutMs?: number;
}

type InitState =
  | { status: 'idle' }
  | { status: 'loading'; promise: Promise<SecureClient> }
  | { status: 'ready'; client: SecureClient }
  | { status: 'failed'; error: Error };

let initState: InitState = { status: 'idle' };

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function assertBrowser(op: string): void {
  if (!isBrowser()) {
    throw new Error(
      `Weavr SDK: ${op} was called in a non-browser environment. ` +
        `The Weavr client can only run in the browser.`
    );
  }
}

/**
 * Test-only: reset module-level init state. Not exported publicly.
 * @internal
 */
export function __resetWeavrClientForTests(): void {
  initState = { status: 'idle' };
}

function loadScript(url: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
    };

    script.onload = () => {
      cleanup();
      resolve();
    };
    script.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load Weavr script from ${url}`));
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out loading Weavr script from ${url} after ${timeoutMs}ms`));
    }, timeoutMs);

    document.head.appendChild(script);
  });
}

export async function loadWeavrClient(options: LoadScriptOptions = {}): Promise<SecureClient> {
  assertBrowser('loadWeavrClient');
  const {
    environment = 'sandbox',
    customScriptUrl,
    timeoutMs = DEFAULT_WEAVR_TIMEOUT_MS,
  } = options;

  const scriptUrl =
    customScriptUrl ?? (environment === 'production' ? PRODUCTION_SCRIPT_URL : SANDBOX_SCRIPT_URL);

  await loadScript(scriptUrl, timeoutMs);

  if (!window.OpcUxSecureClient) {
    throw new Error('Weavr client not found on window after script load');
  }

  return window.OpcUxSecureClient;
}

export function getWeavrClient(): SecureClient {
  assertBrowser('getWeavrClient');
  if (!window.OpcUxSecureClient) {
    throw new Error(
      'Weavr client not initialized. Call initWeavr() first or use the WeavrProvider.'
    );
  }
  return window.OpcUxSecureClient;
}

export interface WeavrInitConfig {
  uiKey: string;
  environment?: WeavrEnvironment;
  customScriptUrl?: string;
  fonts?: InitOptions['fonts'];
  timeoutMs?: number;
}

export async function initWeavr(config: WeavrInitConfig): Promise<SecureClient> {
  assertBrowser('initWeavr');
  const { uiKey, environment, customScriptUrl, fonts, timeoutMs } = config;

  if (initState.status === 'ready') return initState.client;
  if (initState.status === 'loading') return initState.promise;

  const promise = (async () => {
    const client = await loadWeavrClient({ environment, customScriptUrl, timeoutMs });
    try {
      client.init(uiKey, fonts ? { fonts } : undefined);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      initState = { status: 'failed', error };
      throw error;
    }
    initState = { status: 'ready', client };
    return client;
  })().catch((err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    if (initState.status !== 'ready') {
      initState = { status: 'failed', error };
    }
    throw error;
  });

  initState = { status: 'loading', promise };
  return promise;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export function associateUserToken(
  authToken: string,
  timeoutMs: number = DEFAULT_WEAVR_TIMEOUT_MS
): Promise<void> {
  assertBrowser('associateUserToken');
  const p = new Promise<void>((resolve, reject) => {
    const client = getWeavrClient();
    client.associate(authToken, resolve, reject);
  });
  return withTimeout(p, timeoutMs, 'associateUserToken');
}

export function setUserToken(
  authToken: string,
  timeoutMs: number = DEFAULT_WEAVR_TIMEOUT_MS
): Promise<void> {
  assertBrowser('setUserToken');
  const p = new Promise<void>((resolve, reject) => {
    const client = getWeavrClient();
    client.setUserToken(authToken, resolve, reject);
  });
  return withTimeout(p, timeoutMs, 'setUserToken');
}
