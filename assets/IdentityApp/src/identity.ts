import { initSync } from "@iota/identity-wasm/web";
import { IdentityClientReadOnly, IotaDID } from "@iota/identity-wasm/web";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";

import { linkBridge } from "@webview-bridge/web";
import type { AppBridge } from "../../../AppBridge"; // Import the type 'appBridge' declared in native

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

bridge.getMessage().then((message) => console.log(message)); // Expecting "Hello, I'm native"

//@ts-ignore
const convertDataURIToBinary = (dataURI) =>
  Uint8Array.from(window.atob(dataURI.replace(/^data[^,]+,/, "")), (v) =>
    v.charCodeAt(0)
  );
