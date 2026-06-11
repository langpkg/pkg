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
    <img data="version" src="https://img.shields.io/badge/v-0.1.0-black"/>
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
    <img src="https://img.shields.io/badge/update-blue"/>
    <a href="./version.md"><img src="https://img.shields.io/badge/version-black"/></a>
    <a href="./publish.md"><img src="https://img.shields.io/badge/publish-black"/></a>
    <a href="./list.md"><img src="https://img.shields.io/badge/list-black"/></a>
    <a href="./exec.md"><img src="https://img.shields.io/badge/exec-black"/></a>
    <a href="./fmt.md"><img src="https://img.shields.io/badge/fmt-black"/></a>

</div>
<br>

<!-- ╚════════════════════════════════════════════════════════════╝ -->



<!-- ╔═══════════════════════════ DOC ════════════════════════════╗ -->

- ## Update

    > The `update` command checks and installs newer versions of your project dependencies, with options for interactive selection or latest versions.

    ```bash
    # Basic usage
    pkg up                          # Check for updates (interactive)
    pkg up express                  # Update specific package
    pkg up express react            # Update multiple packages

    # Modes
    pkg up -i                       # Interactive mode (--interactive)
    pkg up -l                       # Update to latest (--latest)
    pkg up express -l               # Update express to latest

    # Aliases
    pkg update express              # Full command name
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
