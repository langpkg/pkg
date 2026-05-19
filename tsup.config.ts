// tsup.config.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { defineConfig } from 'tsup';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CONF ════════════════════════════════════════╗

    export default defineConfig({

        "entry"        : ["src/index.ts"],
        "format"       : ["esm", "cjs"],
        "dts"          : true,
        "minify"       : true,
        "sourcemap"    : false,
        "clean"        : true,
        "splitting"    : true,
        "banner"       : {
            "js"         : "#!/usr/bin/env bun"
        },
        "external"     : [
            "bun",
            "@langpkg/mcs_fmt",
            "@langpkg/mcs_gen"
        ]

    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
