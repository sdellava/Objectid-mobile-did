import { Bridge, bridge, postMessageSchema } from "@webview-bridge/react-native";

interface AppBridgeState extends Bridge {
  getMessage(): Promise<string>;
  setResolvedDID(DID: string): Promise<void>;
  setInitialized(): Promise<void>;
  initialized: boolean,
  resolvedDID: string,
};


// Register functions in the bridge object in your React Native code
export const appBridge = bridge<AppBridgeState>(({ set }) => ({
  async getMessage() {
    return "Hello, I'm native";
  },
  async setInitialized() {
    set({
      initialized: true
    })
  },
  async setResolvedDID(DID: string) {
    set({
      resolvedDID: DID
    })
  },
  initialized: false,
  resolvedDID: "",
  // ... Add more functions as needed
}));

// Export the bridge type to be used in the web application
export type AppBridge = typeof appBridge;

export const appPostMessageSchema = postMessageSchema({
  init: {
    validate: (data) => data as string, // This is not recommended; please use validation libraries like zod or valibot.
  },
  resolve: {
    validate: (data) => data as string,  // This is not recommended; please use validation libraries like zod or valibot.
  },
});

// Export the event schema to be used in the web application
export type AppPostMessageSchema = typeof appPostMessageSchema;