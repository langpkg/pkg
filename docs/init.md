<!-- ╔═══════════════════════════ BEG ════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="../assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <p align="center" style="font-style:italic; color:gray;">
        Build, manage, publish, and test packages with zero configuration.<br>
        <b>Stop worrying about configuration. Start building.</b>
        <br>
    </p>
    <img data="version" src="https://img.shields.io/badge/v-0.0.6-black"/>
    <a href="https://github.com/langpkg"><img src="https://img.shields.io/badge/@-langpkg-black"/></a>
    <br>
    <img src="https://img.shields.io/badge/coverage-~%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/langpkg/lexer?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/langpkg/lexer?style=social" alt="GitHub Repo stars" />
    <br>
    <a href="../README.md"><img src="https://img.shields.io/badge/Home-black"/></a>
    <img src="https://img.shields.io/badge/init-blue"/>
    <a href="./install.md"><img src="https://img.shields.io/badge/install-black"/></a>
    <a href="./uninstall.md"><img src="https://img.shields.io/badge/uninstall-black"/></a>
    <a href="./test.md"><img src="https://img.shields.io/badge/test-black"/></a>
    <a href="./lint.md"><img src="https://img.shields.io/badge/lint-black"/></a>
    <a href="./build.md"><img src="https://img.shields.io/badge/build-black"/></a>
    <a href="./link.md"><img src="https://img.shields.io/badge/link-black"/></a>
    <a href="./unlink.md"><img src="https://img.shields.io/badge/unlink-black"/></a>
    <a href="./update.md"><img src="https://img.shields.io/badge/update-black"/></a>
    <a href="./version.md"><img src="https://img.shields.io/badge/version-black"/></a>
    <a href="./publish.md"><img src="https://img.shields.io/badge/publish-black"/></a>
    <a href="./list.md"><img src="https://img.shields.io/badge/list-black"/></a>
    <a href="./exec.md"><img src="https://img.shields.io/badge/exec-black"/></a>
    <a href="./fmt.md"><img src="https://img.shields.io/badge/fmt-black"/></a>

</div>

<br>

<!-- ╚════════════════════════════════════════════════════════════╝ -->



<!-- ╔═══════════════════════════ DOC ════════════════════════════╗ -->

- ## Init

    > The `init` command scaffolds a new project with a complete folder structure, configuration files, and TypeScript setup.

    ```bash
    pkg init                        # Init current dir, prompt for name & type
    pkg init <name>                 # Create <name>/ subfolder
    pkg init <name> --as cli        # CLI package
    pkg init <name> --as pkg        # Normal package
    pkg init <name> --dir <dir>     # Custom output directory
    pkg init <name> --as cli -y     # Skip all prompts
    ```

    ---

    - #### Target Directory

        | Command                            | Target               |
        | ---------------------------------- | -------------------- |
        | `pkg init`                         | Current dir          |
        | `pkg init mycli`                   | `<cwd>/mycli/`       |
        | `pkg init @langpkg/cli`            | `<cwd>/cli/`         |
        | `pkg init mycli --dir ../projects` | `../projects/mycli/` |

        > If target already has `package.json`, command stops immediately.

    - #### Project Types

        | Mode     | Output    | Include     |
        | -------- | --------- | ----------- |
        | `normal` | ESM + CJS | --          |
        | `cli`    | ESM + CJS | + Bin field |

    - #### Prompts (when args not provided)

        - **Package name** → plain or scoped (`@org/repo`)
        - **Project type** → Normal package or CLI package
        - **Metadata** → description, version (`0.0.1`), license (`MIT`)
        - **Author** → `Name, Email, GitHubUser` (comma-separated, all optional)
        - **Repository** → GitHub org + repo name

        > Use `-y` with `<name>` and `--as` to skip all prompts.

    - #### Generated Structure

        ```
        root/
        ┡ .vscode/settings.json
        ┃
        ┡ assets/img/
        ┡ docs/                   # .gitkeep
        ┃
        ┡ src/index.ts
        ┡ test/index.test.ts
        ┃
        ┡ README.md
        ┡ package.json
        ┃
        ┡ tsconfig.json
        ┡ tsup.config.ts
        ┡ eslint.config.mjs
        ┃
        ┡ LICENSE
        ┕ .gitignore
        ```

<!-- ╚════════════════════════════════════════════════════════════╝ -->



<!-- ╔═══════════════════════════ END ════════════════════════════╗ -->

<br>
<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚════════════════════════════════════════════════════════════╝ -->
