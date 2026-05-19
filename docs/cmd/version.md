<!-- ╔═══════════════════════════ BEG ════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="../../assets/img/logo.png" alt="logo" style="" height="60" />
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
    <a href="../../README.md"><img src="https://img.shields.io/badge/Home-black"/></a>
    <a href="./init.md"><img src="https://img.shields.io/badge/init-black"/></a>
    <a href="./install.md"><img src="https://img.shields.io/badge/install-black"/></a>
    <a href="./uninstall.md"><img src="https://img.shields.io/badge/uninstall-black"/></a>
    <a href="./test.md"><img src="https://img.shields.io/badge/test-black"/></a>
    <a href="./lint.md"><img src="https://img.shields.io/badge/lint-black"/></a>
    <a href="./build.md"><img src="https://img.shields.io/badge/build-black"/></a>
    <a href="./link.md"><img src="https://img.shields.io/badge/link-black"/></a>
    <a href="./unlink.md"><img src="https://img.shields.io/badge/unlink-black"/></a>
    <a href="./update.md"><img src="https://img.shields.io/badge/update-black"/></a>
    <img src="https://img.shields.io/badge/version-blue"/>
    <a href="./publish.md"><img src="https://img.shields.io/badge/publish-black"/></a>
    <a href="./list.md"><img src="https://img.shields.io/badge/list-black"/></a>
    <a href="./exec.md"><img src="https://img.shields.io/badge/exec-black"/></a>
    <a href="./fmt.md"><img src="https://img.shields.io/badge/fmt-black"/></a>

</div>
<br>

<!-- ╚════════════════════════════════════════════════════════════╝ -->



<!-- ╔═══════════════════════════ DOC ════════════════════════════╗ -->

- ## Version

    > The `version` command bumps your package version following semantic versioning rules and updates version badges in README and docs files.

    ```bash
    # Increment mode (bump by 1 with carry-over)
    pkg ver patch                   # Increment patch: 1.0.0 → 1.0.1
    pkg ver minor                   # Increment minor: 1.0.0 → 1.1.0 (resets patch)
    pkg ver major                   # Increment major: 1.0.0 → 2.0.0

    # Increment with flags (same as args)
    pkg ver --patch                 # Increment patch: 1.0.99 → 1.1.0
    pkg ver --minor                 # Increment minor: 1.99.3 → 2.0.0
    pkg ver --major                 # Increment major: 1.99.99 → 2.0.0

    # Absolute mode (set to specific value)
    pkg ver 2.5.3                   # Set to exact version string
    pkg ver --patch 2               # Set patch to 2: 1.0.0 → 1.0.2
    pkg ver --minor 5               # Set minor to 5: 1.0.0 → 1.5.0
    pkg ver --major 3               # Set major to 3: 1.0.0 → 3.0.0
    pkg ver --patch=99              # Set patch to 99: 1.0.0 → 1.0.99

    # Aliases
    pkg version patch               # Full command name (ver = version)
    ```

    - #### Bumping Rules

        | Mode        | Command              | Starting Version | Result  | Notes                    |
        | ----------- | -------------------- | ---------------- | ------- | ------------------------ |
        | Increment   | `--patch`            | 1.0.0            | 1.0.1   | Normal patch bump        |
        | Increment   | `--patch`            | 1.0.99           | 1.1.0   | Carries to minor at 100  |
        | Increment   | `--patch`            | 1.99.99          | 2.0.0   | Double carry-over        |
        | Increment   | `--minor`            | 1.0.0            | 1.1.0   | Resets patch to 0        |
        | Increment   | `--minor`            | 1.99.5           | 2.0.0   | Carries to major at 100  |
        | Increment   | `--major`            | 1.99.99          | 2.0.0   | Resets minor/patch to 0  |
        | Absolute    | `--patch=99`         | 1.0.0            | 1.0.99  | Sets patch directly      |
        | Absolute    | `--minor 50`         | 1.0.0            | 1.50.0  | Sets minor directly      |
        | Absolute    | `--major 3`          | 1.0.0            | 3.0.0   | Sets major directly      |
        | Absolute    | `2.5.3`              | Any              | 2.5.3   | Sets full version string |

        > **Component Limits:** Patch/minor have max value of 100. When incremented beyond 100, they carry over to the next component. Major is unlimited. When incrementing minor/major, patch resets to 0.

    - #### What It Updates

        - ✅ `package.json` version field
        - ✅ All `<img data="version" src="...">` badges in README.md
        - ✅ All version badges in docs/ folder markdown files

    - #### Examples

        ```bash
        # Starting version: 1.2.3

        # Increment patch normally
        pkg ver --patch          # 1.2.3 → 1.2.4

        # Increment patch at boundary (carries to minor)
        pkg ver --patch=99       # 1.2.3 → 1.2.99
        pkg ver --patch          # 1.2.99 → 1.3.0

        # Increment minor (resets patch)
        pkg ver --minor          # 1.3.0 → 1.4.0

        # Set at boundary with increment
        pkg ver --minor=99       # 1.4.0 → 1.99.0
        pkg ver --minor          # 1.99.0 → 2.0.0 (carries to major)

        # Double carry-over
        pkg ver --patch=99       # 2.0.0 → 2.0.99
        pkg ver --minor=99       # 2.0.99 → 2.99.99
        pkg ver --patch          # 2.99.99 → 3.0.0 (carries twice)

        # Set exact version
        pkg ver 5.2.1            # Any → 5.2.1
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
