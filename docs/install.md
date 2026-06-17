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
    <img src="https://img.shields.io/badge/install-blue"/>
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

- ## Install

    > The `install` command adds packages to your project dependencies. Supports dev, peer, and global installation modes.

    ```bash
    # Basic usage
    pkg i                           # Install all dependencies
    pkg i express                   # Add to dependencies
    pkg i express react vue         # Add multiple packages

    # Modes
    pkg i express -D                # Dev dependency (--dev)
    pkg i express -p                # Peer dependency (--peer)
    pkg i express --exact           # Use exact version
    pkg i express -g                # Install globally (--global)

    # Aliases
    pkg install express             # Full command name
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
