import { Bridge, bridge, postMessageSchema } from "@webview-bridge/react-native";

interface AppBridgeState extends Bridge {
  getMessage(): Promise<string>;
  setResolvedDID(DID: string): Promise<void>;
  setInitialized(): Promise<void>;
  initialized: boolean;
  resolvedDID: string;
}

// Register functions in the bridge object in your React Native code
interface AppBridgeState extends Bridge {
  getMessage(): Promise<string>;
  setResolvedDID(DID: string): Promise<void>;
  setInitialized(): Promise<void>;
  initialized: boolean;
  resolvedDID: string;
  setCreatedDID(DID: string): Promise<void>;
  createdDID: string;
}

export const appBridge = bridge<AppBridgeState>(({ set }) => ({
  async getMessage() {
    return "Hello, I'm native";
  },
  async setInitialized() {
    set({ initialized: true });
  },
  async setResolvedDID(DID: string) {
    set({ resolvedDID: "" }); // reset
    setTimeout(() => {
      set({ resolvedDID: DID }); // set dopo 10ms
    }, 10);
  },
  async setCreatedDID(DIDdocument: string) {
    set({ createdDID: DIDdocument });
  },
  initialized: false,
  resolvedDID: "",
  createdDID: "",
}));

interface CreateMessage {
  seed: string;
  network: string;
}

// Export the bridge type to be used in the web application
export type AppBridge = typeof appBridge;

export const appPostMessageSchema = postMessageSchema({
  init: {
    validate: (data) => data as string,
  },
  resolve: {
    validate: (data) => data as string,
  },
  create: {
    validate: (data) => data as CreateMessage,
  },
});

// Export the event schema to be used in the web application
export type AppPostMessageSchema = typeof appPostMessageSchema;
