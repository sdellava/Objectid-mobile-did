import React, { useEffect, useState } from "react";
import { useAssets } from "expo-asset";

import { createWebView } from "@webview-bridge/react-native";
import { appBridge, appPostMessageSchema } from "./AppBridge";

export const { WebView, postMessage } = createWebView({
  bridge: appBridge,
  postMessageSchema: appPostMessageSchema,
  debug: true, // Enable console.log visibility in the native WebView
});

export default function IdentityWebView() {
  const [WasmAssets, WasmError] = useAssets([
    // load Wasm binary from WebApp to provide to WebApp initialization
    require("./assets/IdentityApp/node_modules/@iota/identity-wasm/web/identity_wasm_bg.wasm"),
  ]);

  const [assets, error] = useAssets([require("./assets/IdentityApp/dist/index.html")]);

  const [webViewLoad, setWebViewLoad] = useState(false);

  useEffect(() => {
    const initWasm = async (path: string) => {
      console.log(WasmAssets);

      try {
        const response = await fetch(path);
        const blob = await response.blob();
        var reader = new FileReader();
        reader.onload = function () {
          postMessage("init", this.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error(error);
      }
    };

    if (!WasmAssets || !webViewLoad) return;

    const localUri = WasmAssets?.at(0)?.localUri;

    if (!localUri) return;

    initWasm(localUri);
  }, [webViewLoad, WasmAssets, error]);

  return (
    <WebView
      // hide WebView
      containerStyle={{ position: "absolute", width: 0, height: 0 }}
      allowFileAccess
      // Pass the source code of React app
      source={{ uri: assets?.at(0)?.localUri ?? "" }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn("WebView error: ", nativeEvent);
      }}
      onLoad={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.log(nativeEvent.url);
        setWebViewLoad(true);
      }}
    />
  );
}
