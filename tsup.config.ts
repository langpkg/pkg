// tsup.config.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { defineConfig } from 'tsup';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ CONST ════════════════════════════════════════╗

    const rules        = {
        "clean"        : true,
        "dts"          : true,
        "entry"        : ["src/index.ts"],
        "format"       : ["esm", "cjs"],
        "minify"       : true,
        "sourcemap"    : false,
        "splitting"    : false,
        "treeshake"    : true,
        "target"       : 'es2022',
        "outDir"       : 'dist',
        "external"     : [
            "bun",
            "@langpkg/mcs_fmt",
            "@langpkg/mcs_gen"
        ],
        "banner"       : {
            "js"       : "#!/usr/bin/env bun"
        }
    };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CONF ════════════════════════════════════════╗

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export default defineConfig(rules as any);

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
