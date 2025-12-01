import type { SecureClient, InitOptions } from './types';

const SANDBOX_SCRIPT_URL = 'https://sandbox.weavr.io/app/secure/static/client.1.js';
const PRODUCTION_SCRIPT_URL = 'https://secure.weavr.io/app/secure/static/client.1.js';

export type WeavrEnvironment = 'sandbox' | 'production';

interface LoadScriptOptions {
  environment?: WeavrEnvironment;
  customScriptUrl?: string;
}

let scriptLoadPromise: Promise<SecureClient> | null = null;
let clientInitialized = false;

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Weavr script from ${url}`));
    document.head.appendChild(script);
  });
}

export async function loadWeavrClient(options: LoadScriptOptions = {}): Promise<SecureClient> {
  const { environment = 'sandbox', customScriptUrl } = options;

  const scriptUrl =
    customScriptUrl ?? (environment === 'production' ? PRODUCTION_SCRIPT_URL : SANDBOX_SCRIPT_URL);

  await loadScript(scriptUrl);

  if (!window.OpcUxSecureClient) {
    throw new Error('Weavr client not found on window after script load');
  }

  return window.OpcUxSecureClient;
}

export function getWeavrClient(): SecureClient {
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
}

export async function initWeavr(config: WeavrInitConfig): Promise<SecureClient> {
  const { uiKey, environment, customScriptUrl, fonts } = config;

  // Reuse existing load promise to prevent duplicate loads
  if (!scriptLoadPromise) {
    scriptLoadPromise = loadWeavrClient({ environment, customScriptUrl });
  }

  const client = await scriptLoadPromise;

  // Only initialize once - the SDK doesn't support re-initialization
  if (!clientInitialized) {
    client.init(uiKey, fonts ? { fonts } : undefined);
    clientInitialized = true;
  }

  return client;
}

export function associateUserToken(authToken: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getWeavrClient();
    client.associate(authToken, resolve, reject);
  });
}

export function setUserToken(authToken: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getWeavrClient();
    client.setUserToken(authToken, resolve, reject);
  });
}
