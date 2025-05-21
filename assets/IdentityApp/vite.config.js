import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig(({ command, mode }) => {

    return {
        plugins: [viteSingleFile()],
        server: {
            // open on default port or fail to make CI consistent
            strictPort: true,
        },
        build: {
            rollupOptions: {
                output: {
                    interop: "auto",
                },
                external: ['@iota/identity-wasm/web/identity_wasm_bg.wasm?url']
            },
        },
    };
});
