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
    <img data="version" src="https://img.shields.io/badge/v-0.1.3-black"/>
    <a href="https://github.com/langpkg"><img src="https://img.shields.io/badge/@-langpkg-black"/></a>
    <br>
    <img src="https://img.shields.io/badge/coverage-~%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/langpkg/lexer?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/langpkg/lexer?style=social" alt="GitHub Repo stars" />
    <br>
    <a href="../README.md"><img src="https://img.shields.io/badge/Home-black"/></a>
    <a href="./init.md"><img src="https://img.shields.io/badge/init-black"/></a>
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
    <img src="https://img.shields.io/badge/fmt-blue"/>

</div>
<br>

<!-- ╚════════════════════════════════════════════════════════════╝ -->



<!-- ╔═══════════════════════════ DOC ════════════════════════════╗ -->

- ## Format

    > The `fmt` command formats TypeScript and JSON files according to MCS (Maysara Code Style) conventions with zero external dependencies. It detects issues, applies fixes automatically, and maintains a cache for incremental formatting.

    ```bash
    # Format current directory
    pkg fmt

    # Format specific directory
    pkg fmt src/

    # Format specific file
    pkg fmt src/app.ts

    # Clear cache before formatting
    pkg fmt --clean
    pkg fmt -c src/
    ```

- ## Configuration

    > By default, `fmt` collects TypeScript files from `src/`, `test/`, and `bench/`. You can override these directories in `package.json` under `pkg.fmt`:

    ```jsonc
    {
        "pkg": {
            "fmt": {
                "ts": ["src", "test", "bench", "scripts"]
            }
        }
    }
    ```

    > If `pkg.fmt.ts` is not defined or empty, the default directories are used.

<!-- ╚════════════════════════════════════════════════════════════╝ -->



<!-- ╔═══════════════════════════ END ════════════════════════════╗ -->

<br>
<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚════════════════════════════════════════════════════════════╝ -->