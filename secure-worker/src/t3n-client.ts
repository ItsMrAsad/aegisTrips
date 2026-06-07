/**
 * Terminal 3 T3N SDK integration.
 *
 * Uses require() to load the CJS build of @terminal3/t3n-sdk so the WASM
 * component initialises correctly in a Node.js CommonJS context.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const t3nSdk = require("@terminal3/t3n-sdk") as {
  T3nClient: new (config: {
    wasmComponent: unknown;
    baseUrl?: string;
    handlers: { EthSign: unknown };
  }) => {
    handshake(): Promise<unknown>;
    authenticate(input: unknown): Promise<{ value: string }>;
    execute(payload: unknown): Promise<string>;
  };
  loadWasmComponent(config?: unknown): Promise<unknown>;
  createEthAuthInput(address: string): unknown;
  eth_get_address(privateKey: string): string;
  metamask_sign(
    address: string,
    provider: null | undefined,
    privateKey: string
  ): unknown;
  setEnvironment(env: "testnet" | "production"): void;
};

export interface T3NStatus {
  connected: boolean;
  tenantDid: string | null;
  network: string;
  sdkVersion: string;
  walletAddress?: string;
  error?: string;
}

const PRIVATE_KEY = process.env.T3N_PRIVATE_KEY ?? "";
const T3N_ENV = (process.env.T3N_ENVIRONMENT ?? "testnet") as
  | "testnet"
  | "production";

let cachedStatus: T3NStatus = {
  connected: false,
  tenantDid: null,
  network: T3N_ENV,
  sdkVersion: "3.5.0",
};

let t3nClient: ReturnType<typeof t3nSdk.T3nClient.prototype.constructor> | null = null;

export async function initT3N(): Promise<T3NStatus> {
  if (!PRIVATE_KEY) {
    cachedStatus = {
      connected: false,
      tenantDid: null,
      network: T3N_ENV,
      sdkVersion: "3.5.0",
      error: "T3N_PRIVATE_KEY not set — running in simulation mode",
    };
    console.warn("[TEE] T3N_PRIVATE_KEY not configured. Simulation mode active.");
    return cachedStatus;
  }

  try {
    const {
      T3nClient,
      loadWasmComponent,
      createEthAuthInput,
      eth_get_address,
      metamask_sign,
      setEnvironment,
    } = t3nSdk;

    setEnvironment(T3N_ENV);

    const wasmComponent = await loadWasmComponent();
    const address = eth_get_address(PRIVATE_KEY);

    console.log(
      `[TEE] T3N SDK v3.5.0 — env=${T3N_ENV} wallet=${address.slice(0, 10)}...`
    );

    const client = new T3nClient({
      wasmComponent,
      handlers: {
        EthSign: metamask_sign(address, undefined, PRIVATE_KEY),
      },
    });

    await client.handshake();
    const did = await client.authenticate(createEthAuthInput(address));

    t3nClient = client;
    cachedStatus = {
      connected: true,
      tenantDid: did.value,
      network: T3N_ENV,
      sdkVersion: "3.5.0",
      walletAddress: address,
    };

    console.log(`[TEE] T3N connected ✓ — DID: ${did.value}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    cachedStatus = {
      connected: false,
      tenantDid: null,
      network: T3N_ENV,
      sdkVersion: "3.5.0",
      error: `T3N init failed: ${msg}`,
    };
    console.warn("[TEE] T3N SDK init failed (simulation fallback):", msg);
  }

  return cachedStatus;
}

/**
 * Seed a credential key into the T3N session.
 * The value is intentionally omitted from the network payload —
 * in production it is injected by the TEE operator via the sealed KV store.
 */
export async function seedCredentialToT3N(
  key: string,
  _value: string
): Promise<boolean> {
  if (!t3nClient || !cachedStatus.connected) return false;

  try {
    await t3nClient.execute({ action: "kv-store-intent", key });
    console.log(`[TEE] T3N credential intent registered: key=${key}`);
    return true;
  } catch {
    // Non-fatal — the testnet may not have this contract deployed.
    return false;
  }
}

export function getT3NStatus(): T3NStatus {
  return cachedStatus;
}
