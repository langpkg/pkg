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
    <img data="version" src="https://img.shields.io/badge/v-0.0.3-black"/>
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
    <img src="https://img.shields.io/badge/test-blue"/>
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

- ## Test

    > The `test` command runs your test suite with Bun's fast, Jest-compatible test runner. Tests are discovered automatically in files matching `*.test.ts`, `*_test.ts`, `*.spec.ts`, or `*_spec.ts` patterns.

    ```bash
    # Basic usage
    pkg test                        # Run all tests
    pkg test src/                   # Run tests in directory
    pkg test file.test.ts           # Run single file

    # Watch & modes
    pkg test --watch                # Re-run on file changes
    pkg test --coverage             # Generate coverage report
    pkg test --concurrent           # Run tests in parallel

    # Filtering & control
    pkg test -t "pattern"           # Filter tests by name (--testNamePattern)
    pkg test --bail                 # Bail after first failure
    pkg test --bail=2               # Bail after 2 failures
    pkg test --retry=3              # Retry failed tests 3 times
    pkg test --timeout=10000        # Per-test timeout in milliseconds
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
