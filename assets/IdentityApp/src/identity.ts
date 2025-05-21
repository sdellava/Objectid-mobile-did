import { initSync } from "@iota/identity-wasm/web";
import { IdentityClientReadOnly, IotaDID, JwsAlgorithm } from "@iota/identity-wasm/web";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";

import { linkBridge } from "@webview-bridge/web";
import type { AppBridge } from "../../../AppBridge"; // Import the type 'appBridge' declared in native
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { createDocumentForNetworkUsingKeyPair, getIdentityFromKeyPair, getMemstorage } from "./DIDutils";

window.addEventListener("create", async (event: any) => {
  const { seed, network } = event.detail;
  try {
    const keyPair = Ed25519Keypair.deriveKeypairFromSeed(seed);
    const storage = getMemstorage();
    const client = new IotaClient({ url: getFullnodeUrl(network) });
    const identityClient = await getIdentityFromKeyPair(client, storage, keyPair, JwsAlgorithm.EdDSA);
    const [unpublished] = await createDocumentForNetworkUsingKeyPair(storage, network, keyPair);
    const { output: identity } = await identityClient
      .createIdentity(unpublished)
      .finish()
      .buildAndExecute(identityClient);
    const didDocument = identity.didDocument();
    window.dispatchEvent(new CustomEvent("setCreatedDID", { detail: didDocument }));
  } catch (error: any) {
    console.error("Error creating DID document:", error);
    alert(error.message ?? error.toString());
  }
});

window.addEventListener("resolve", async (event: any) => {
  const did = event.detail;
  const network = "testnet";
  try {
    const client = new IotaClient({ url: getFullnodeUrl(network) });
    const identityClientReadOnly = await IdentityClientReadOnly.create(client);
    const iotaDid = IotaDID.fromAliasId(did, network);
    const didDocument = await identityClientReadOnly.resolveDid(iotaDid);
    window.dispatchEvent(new CustomEvent("setResolvedDID", { detail: didDocument }));
  } catch (error) {
    alert(error);
  }
});

const bridge = linkBridge<AppBridge>({
  onReady: async () => {
    console.log("bridge is ready");
    // const version = await method.getBridgeVersion();
    // console.log("currentBridgerVersion", version);
  },
});

bridge.addEventListener("init", async (message) => {
  try {
    initSync(convertDataURIToBinary(message));
    bridge.setInitialized();
  } catch (error) {
    alert(error);
  }
});

const network = "testnet";
bridge.addEventListener("resolve", async (message) => {
  if (typeof message != "string") return;
  try {
    const client = new IotaClient({ url: getFullnodeUrl(network) });

    const identityClientReadOnly = await IdentityClientReadOnly.create(client);

    const iotaDid = IotaDID.fromAliasId(message, network);

    const didDocument = await identityClientReadOnly.resolveDid(iotaDid);

    bridge.setResolvedDID(JSON.stringify(didDocument, null, 2));
  } catch (error) {
    alert(error);
  }
});

interface CreateMessage {
  seed: string;
  network: string;
}

bridge.addEventListener("create", async (message: unknown) => {
  function isCreateMessage(obj: any): obj is CreateMessage {
    return obj && typeof obj === "object" && typeof obj.seed === "string" && typeof obj.network === "string";
  }

  if (!isCreateMessage(message)) {
    console.error("Invalid message format for create event.");
    return;
  }

  const { seed, network } = message;

  console.log("Creating DID document with seed", seed, "and network", network);

  try {
    const keyPair = Ed25519Keypair.deriveKeypairFromSeed(seed);
    const storage = getMemstorage();
    const client = new IotaClient({ url: getFullnodeUrl(network) });
    const identityClient = await getIdentityFromKeyPair(client, storage, keyPair, JwsAlgorithm.EdDSA);

    const [unpublished] = await createDocumentForNetworkUsingKeyPair(storage, network, keyPair);

    const { output: identity } = await identityClient
      .createIdentity(unpublished)
      .finish()
      .buildAndExecute(identityClient);

    const didDocument = identity.didDocument();

    await bridge.setCreatedDID(JSON.stringify(didDocument, null, 2));
  } catch (error: any) {
    console.error("Error creating DID document:", error);
    alert(error.message ?? error.toString());
  }
});

bridge.getMessage().then((message) => console.log(message)); // Expecting "Hello, I'm native"

//@ts-ignore
const convertDataURIToBinary = (dataURI) =>
  Uint8Array.from(window.atob(dataURI.replace(/^data[^,]+,/, "")), (v) => v.charCodeAt(0));
