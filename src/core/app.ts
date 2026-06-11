// src/core/app.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { ProjectType, ParsedCommand }                  from './common/types';
    import      { UninstallCommand, UninstallCommandParams }    from './cmd/uninstall';
    import      { InstallCommand, InstallCommandParams }        from './cmd/install';
    import      { PublishCommand, PublishCommandParams }        from './cmd/publish';
    import      { VersionCommand, VersionCommandParams }        from './cmd/version';
    import      { UnlinkCommand, UnlinkCommandParams }          from './cmd/unlink';
    import      { UpdateCommand, UpdateCommandParams }          from './cmd/update';
    import      { BuildCommand, BuildCommandParams }            from './cmd/build';
    import      { InitCommand, InitCommandParams }              from './cmd/init';
    import      { TestCommand, TestCommandParams }              from './cmd/test';
    import      { LintCommand, LintCommandParams }              from './cmd/lint';
    import      { LinkCommand, LinkCommandParams }              from './cmd/link';
    import      { ExecCommand, ExecCommandParams }              from './cmd/exec';
    import      { ListCommand, ListCommandParams }              from './cmd/list';
    import      { FmtCommand, FmtCommandParams }                from './cmd/fmt';
    import      { cli }                                         from '@langpkg/cli';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface AppConfig {
        name    : string;
        version : string;
        desc    : string;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class App {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public config: AppConfig) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            run() {
                // CLI Setup
                cli(this.config.name, this.config.version) .description(this.config.desc)

                // init
                .command({
                    name                            : 'init',
                    description                     : 'Initialize a new project',

                    args                            : [
                        {
                            name                    : 'name',
                            required                : false, // prompted interactively if omitted
                            description             : 'Package name (e.g. @org/repo or myrepo)',
                        },
                    ],

                    options                         : [
                        {
                            name                    : 'as',
                            flag                    : '--as',
                            type                    : 'string',
                            required                : false,
                            description             : 'Project type: normal (library) or cli (executable)',
                        },
                        {
                            name                    : 'dir',
                            flag                    : '--dir',
                            type                    : 'string',
                            required                : false,
                            description             : 'Target directory to initialize in (skips creating a <name> subfolder)',
                        },
                        {
                            name                    : 'yes',
                            flag                    : '-y',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Skip all prompts and use defaults (requires <name> and --as to be passed)',
                        },
                    ],

                    action: (parsed: ParsedCommand) => {
                        const params: InitCommandParams = {
                            args                    : {
                                name                : parsed.args.name      as string       | undefined,
                            },
                            options                 : {
                                as                  : parsed.options?.as    as ProjectType  | undefined,
                                dir                 : parsed.options?.dir   as string       | undefined,
                                yes                 : parsed.options?.yes   as boolean      | undefined,
                            },
                        };
                        this.runInitCommand(params);
                    },
                })

                // build
                .command({
                    name                            : 'build',
                    description                     : 'Build package with tsup',

                    args                            : [],

                    options                         : [
                        {
                            name                    : 'watch',
                            flag                    : '--watch',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Watch mode',
                        },
                        {
                            name                    : 'clean',
                            flag                    : '--clean',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Remove dist/ before building',
                        },
                    ],

                    action: (parsed) => {
                        const params: BuildCommandParams = {
                            args                    : {},
                            options                 : {
                                watch               : parsed.options?.watch as boolean | undefined,
                                clean               : parsed.options?.clean as boolean | undefined,
                            },
                        };
                        this.runBuildCommand(params);
                    },
                })

                // test
                .command({
                    name                            : 'test',
                    description                     : 'Run tests with bun test',

                    allowDynamicArgs                : true,

                    options                         : [
                        {
                            name                    : 'watch',
                            flag                    : '--watch',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Watch mode',
                        },
                        {
                            name                    : 'coverage',
                            flag                    : '--coverage',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Generate coverage report',
                        },
                        {
                            name                    : 'testNamePattern',
                            flag                    : '-t',
                            type                    : 'string',
                            required                : false,
                            description             : 'Filter tests by name pattern',
                        },
                        {
                            name                    : 'retry',
                            flag                    : '--retry',
                            type                    : 'string',
                            required                : false,
                            description             : 'Retry failed tests',
                        },
                        {
                            name                    : 'timeout',
                            flag                    : '--timeout',
                            type                    : 'string',
                            required                : false,
                            description             : 'Per-test timeout in milliseconds',
                        },
                        {
                            name                    : 'concurrent',
                            flag                    : '--concurrent',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Run tests in parallel',
                        },
                        {
                            name                    : 'bail',
                            flag                    : '--bail',
                            type                    : 'string',
                            required                : false,
                            description             : 'Bail after n failures (use --bail or --bail=2)',
                        },
                    ],

                    action: (parsed) => {
                        const params: TestCommandParams = {
                            args                    : {},
                            dynamicArgs             : parsed.dynamicArgs,
                            options                 : {
                                watch               : parsed.options?.watch as boolean | undefined,
                                coverage            : parsed.options?.coverage as boolean | undefined,
                                testNamePattern     : parsed.options?.testNamePattern as string | undefined,

                                retry               : parsed.options?.retry
                                ? parseInt(parsed.options.retry as string)
                                : undefined,

                                timeout             : parsed.options?.timeout
                                ? parseInt(parsed.options.timeout as string)
                                : undefined,

                                bail                : parsed.options?.bail
                                ? parsed.options.bail === 'true' || parsed.options.bail === ''
                                ? true
                                : parseInt(parsed.options.bail as string)
                                : undefined,

                                concurrent          : parsed.options?.concurrent as boolean | undefined,
                            },
                        };
                        this.runTestCommand(params);
                    },
                })

                // lint
                .command({
                    name                            : 'lint',
                    description                     : 'Lint code with eslint',

                    args                            : [
                        {
                            name                    : 'paths',
                            required                : false,
                            description             : 'Paths to lint (defaults to src/ and test/)',
                        },
                    ],

                    allowDynamicArgs                : true,

                    options                         : [
                        {
                            name                    : 'fix',
                            flag                    : '--fix',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Automatically fix violations',
                        },
                        {
                            name                    : 'fixDryRun',
                            flag                    : '--fix-dry-run',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Check fixes without writing',
                        },
                        {
                            name                    : 'format',
                            flag                    : '--format',
                            type                    : 'string',
                            required                : false,
                            description             : 'Output format: stylish, json, compact',
                        },
                        {
                            name                    : 'maxWarnings',
                            flag                    : '--max-warnings',
                            type                    : 'string',
                            required                : false,
                            description             : 'Fail if warnings exceed this number',
                        },
                        {
                            name                    : 'cache',
                            flag                    : '--cache',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Use cache for faster runs',
                        },
                        {
                            name                    : 'quiet',
                            flag                    : '--quiet',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Report errors only',
                        },
                    ],

                    action: (parsed) => {
                        const params: LintCommandParams = {
                            args                    : {},
                            dynamicArgs             : parsed.dynamicArgs,
                            options                 : {
                                fix                 : parsed.options?.fix       as boolean | undefined,
                                fixDryRun           : parsed.options?.fixDryRun as boolean | undefined,

                                format              : parsed.options?.format as
                                | 'stylish'
                                | 'json'
                                | 'compact'
                                | undefined,

                                maxWarnings         : parsed.options?.maxWarnings
                                ? parseInt(parsed.options.maxWarnings as string)
                                : undefined,

                                cache               : parsed.options?.cache as boolean | undefined,
                                quiet               : parsed.options?.quiet as boolean | undefined,
                            },
                        };
                        this.runLintCommand(params);
                    },
                })

                // install
                .command({
                    name                            : 'i',
                    aliases                         : ['install'],
                    description                     : 'Install dependencies or add packages',

                    args                            : [
                        {
                            name                    : 'packages',
                            required                : false,
                            description             : 'Packages to install (e.g., lodash react)',
                        },
                    ],

                    allowDynamicArgs                : true,

                    options                         : [
                        {
                            name                    : 'dev',
                            flag                    : '-D',
                            aliases                 : ['--dev'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Install as dev dependency',
                        },
                        {
                            name                    : 'peer',
                            flag                    : '-p',
                            aliases                 : ['--peer'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Install as peer dependency',
                        },
                        {
                            name                    : 'exact',
                            flag                    : '--exact',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Use exact version instead of ranges',
                        },
                        {
                            name                    : 'global',
                            flag                    : '-g',
                            aliases                 : ['--global'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Install globally instead of locally',
                        },
                    ],

                    action: (parsed) => {
                        // Collect packages from both regular args and dynamic args
                        const packages              : string[] = [];

                        // Include regular args (e.g., first package)
                        if (parsed.args?.packages) {
                            if (Array.isArray(parsed.args.packages)) {
                                packages.push(...parsed.args.packages);
                            } else if (typeof parsed.args.packages === 'string') {
                                packages.push(parsed.args.packages);
                            }
                        }

                        // Include dynamic args (additional packages)
                        if (parsed.dynamicArgs && parsed.dynamicArgs.length > 0) {
                            packages.push(...parsed.dynamicArgs);
                        }

                        const params: InstallCommandParams = {
                            args                    : {},
                            dynamicArgs             : packages,
                            options                 : {
                                dev                 : parsed.options?.dev as boolean | undefined,
                                peer                : parsed.options?.peer as boolean | undefined,
                                exact               : parsed.options?.exact as boolean | undefined,
                                global              : parsed.options?.global as boolean | undefined,
                            },
                        };
                        this.runInstallCommand(params);
                    },
                })

                // uninstall
                .command({
                    name                            : 'uninstall',
                    aliases                         : ['un'],
                    description                     : 'Uninstall packages from project or globally',

                    args                            : [
                        {
                            name                    : 'packages',
                            required                : false,
                            description             : 'Package names to uninstall',
                        },
                    ],

                    allowDynamicArgs                : true,

                    options                         : [
                        {
                            name                    : 'global',
                            flag                    : '-g',
                            aliases                 : ['--global'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Uninstall globally instead of locally',
                        },
                    ],

                    action: (parsed) => {
                        // Collect packages from both regular args and dynamic args
                        const packages: string[] = [];

                        // Include regular args (e.g., first package)
                        if (parsed.args?.packages) {
                            if (Array.isArray(parsed.args.packages)) {
                                packages.push(...parsed.args.packages);
                            } else if (typeof parsed.args.packages === 'string') {
                                packages.push(parsed.args.packages);
                            }
                        }

                        // Include dynamic args (additional packages)
                        if (parsed.dynamicArgs && parsed.dynamicArgs.length > 0) {
                            packages.push(...parsed.dynamicArgs);
                        }

                        const params: UninstallCommandParams = {
                            args                    : {},
                            dynamicArgs             : packages,
                            options                 : {
                                global              : parsed.options?.global as boolean | undefined,
                            },
                        };
                        this.runUninstallCommand(params);
                    },
                })

                // link
                .command({
                    name                            : 'link',
                    description                     : 'Link current package globally or link global packages to project',

                    args                            : [
                        {
                            name                    : 'packages',
                            required                : false,
                            description             : 'Package names to link from global (optional)',
                        },
                    ],

                    allowDynamicArgs                : true,

                    options                         : [],

                    action: (parsed) => {
                        // Collect packages from both args.packages and dynamicArgs
                        const allPackages: string[] = [];
                        if (parsed.args.packages) {
                            allPackages.push(parsed.args.packages as string);
                        }
                        if (parsed.dynamicArgs && parsed.dynamicArgs.length > 0) {
                            allPackages.push(...parsed.dynamicArgs);
                        }

                        const params: LinkCommandParams = {
                            args                    : {},
                            dynamicArgs             : allPackages.length > 0 ? allPackages : undefined,
                            options                 : {}
                        };
                        this.runLinkCommand(params);
                    },
                })

                // unlink
                .command({
                    name                            : 'unlink',
                    description                     : 'Unlink current package from global or unlink global packages from project',

                    args                            : [
                        {
                            name                    : 'packages',
                            required                : false,
                            description             : 'Package names to unlink from project (optional)',
                        },
                    ],

                    allowDynamicArgs                : true,

                    options                         : [],

                    action: (parsed) => {
                        // Collect packages from both args.packages and dynamicArgs
                        const allPackages: string[] = [];
                        if (parsed.args.packages) {
                            allPackages.push(parsed.args.packages as string);
                        }
                        if (parsed.dynamicArgs && parsed.dynamicArgs.length > 0) {
                            allPackages.push(...parsed.dynamicArgs);
                        }

                        const params: UnlinkCommandParams = {
                            args                    : {},
                            dynamicArgs             : allPackages.length > 0 ? allPackages : undefined,
                            options                 : {}
                        };
                        this.runUnlinkCommand(params);
                    },
                })

                // update
                .command({
                    name                            : 'up',
                    aliases                         : ['update'],
                    description                     : 'Update all or specific packages',

                    args                            : [
                        {
                            name                    : 'packages',
                            required                : false,
                            description             : 'Packages to update (e.g., lodash react)',
                        },
                    ],

                    allowDynamicArgs                : true,

                    options                         : [
                        {
                            name                    : 'interactive',
                            flag                    : '-i',
                            aliases                 : ['--interactive'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Interactive update mode',
                        },
                        {
                            name                    : 'latest',
                            flag                    : '-l',
                            aliases                 : ['--latest'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Update to latest versions',
                        },
                    ],

                    action: (parsed) => {
                        const params: UpdateCommandParams = {
                            args                    : {},
                            dynamicArgs             : parsed.dynamicArgs,
                            options                 : {
                                interactive         : parsed.options?.interactive as boolean | undefined,
                                latest              : parsed.options?.latest as boolean | undefined,
                            },
                        };
                        this.runUpdateCommand(params);
                    },
                })

                // publish
                .command({
                    name                            : 'publish',
                    aliases                         : ['pub'],
                    description                     : 'Publish package to npm registry',

                    args                            : [],

                    options                         : [
                        {
                            name                    : 'tag',
                            flag                    : '--tag',
                            type                    : 'string',
                            required                : false,
                            description             : 'Publish under specific dist-tag (e.g., beta, next)',
                        },
                        {
                            name                    : 'public',
                            flag                    : '-y',
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Public access (default)',
                        },
                    ],

                    action: (parsed) => {
                        const params: PublishCommandParams = {
                            args                    : {},
                            options                 : {
                                tag                 : parsed.options?.tag as string | undefined,
                                public              : parsed.options?.public as boolean | undefined,
                            },
                        };
                        this.runPublishCommand(params);
                    },
                })

                // exec
                .command({
                    name                            : 'exec',
                    description                     : 'Execute TypeScript/JavaScript code directly',

                    args                            : [
                        {
                            name                    : 'code',
                            required                : true,
                            description             : 'Code to execute',
                        },
                    ],

                    options                         : [],

                    action: (parsed) => {
                        const params: ExecCommandParams = {
                            args                    : {
                                code                : parsed.args.code as string,
                            },
                            options                 : {}
                        };
                        this.runExecCommand(params);
                    },
                })

                // list
                .command({
                    name                            : 'list',
                    aliases                         : ['ls'],
                    description                     : 'List installed packages (local or global)',

                    args                            : [],

                    options                         : [
                        {
                            name                    : 'global',
                            flag                    : '-g',
                            aliases                 : ['--global'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'List global packages instead of local',
                        },
                    ],

                    action: (parsed) => {
                        const params : ListCommandParams = {
                            args                    : {},
                            options                 : {
                                global              : parsed.options?.global as boolean | undefined,
                            },
                        };
                        this.runListCommand(params);
                    },
                })

                // version
                .command({
                    name                            : 'version',
                    aliases                         : ['ver'],
                    description                     : 'Bump package version and update version badges',

                    args                            : [
                        {
                            name                    : 'type',
                            required                : false,
                            description             : 'Bump type: major, minor, patch, or version string (e.g., 1.2.3)',
                        },
                    ],

                    options                         : [
                        {
                            name                    : 'major',
                            flag                    : '--major',
                            type                    : 'string',
                            required                : false,
                            description             : 'Set major version',
                        },
                        {
                            name                    : 'minor',
                            flag                    : '--minor',
                            type                    : 'string',
                            required                : false,
                            description             : 'Set minor version',
                        },
                        {
                            name                    : 'patch',
                            flag                    : '--patch',
                            type                    : 'string',
                            required                : false,
                            description             : 'Set patch version',
                        },
                    ],

                    action: (parsed) => {
                        const params: VersionCommandParams = {
                            args                    : {
                                type                : parsed.args.type as string | undefined,
                            },
                            options                 : {
                                major               : parsed.options?.major,
                                minor               : parsed.options?.minor,
                                patch               : parsed.options?.patch,
                            },
                        };
                        this.runVersionCommand(params);
                    },
                })

                // fmt - Format TypeScript and JSON files
                .command({
                    name                            : 'fmt',
                    aliases                         : [],
                    description                     : 'Format TypeScript and JSON files',

                    args                            : [
                        {
                            name                    : 'path',
                            required                : false,
                            description             : 'Target file or directory (default: current directory)',
                        },
                    ],

                    options                         : [
                        {
                            name                    : 'clean',
                            flag                    : '--clean',
                            aliases                 : ['-c'],
                            type                    : 'boolean',
                            required                : false,
                            description             : 'Clear the formatter cache before running',
                        },
                    ],

                    action: (parsed) => {
                        const params: FmtCommandParams = {
                            args                    : {
                                path                : parsed.args.path as string | undefined,
                            },
                            options                 : {
                                clean               : parsed.options?.clean as boolean | undefined,
                            },
                        };
                        this.runFmtCommand(params);
                    },
                })

                // Build and run the CLI
                .build().run();
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private runInitCommand(params: InitCommandParams) {
                const init = new InitCommand(params);
                init.run();
            }

            private runBuildCommand(params: BuildCommandParams) {
                const build = new BuildCommand(params);
                build.run();
            }

            private runTestCommand(params: TestCommandParams) {
                const test = new TestCommand(params);
                test.run();
            }

            private runLintCommand(params: LintCommandParams) {
                const lint = new LintCommand(params);
                lint.run();
            }

            private runInstallCommand(params: InstallCommandParams) {
                const install = new InstallCommand(params);
                install.run();
            }

            private runUninstallCommand(params: UninstallCommandParams) {
                const uninstall = new UninstallCommand(params);
                uninstall.run();
            }

            private runLinkCommand(params: LinkCommandParams) {
                const link = new LinkCommand(params);
                link.run();
            }

            private runUnlinkCommand(params: UnlinkCommandParams) {
                const unlink = new UnlinkCommand(params);
                unlink.run();
            }

            private runUpdateCommand(params: UpdateCommandParams) {
                const update = new UpdateCommand(params);
                update.run();
            }

            private runPublishCommand(params: PublishCommandParams) {
                const publish = new PublishCommand(params);
                publish.run();
            }

            private runExecCommand(params: ExecCommandParams) {
                const exec = new ExecCommand(params);
                exec.run();
            }

            private runListCommand(params: ListCommandParams) {
                const list = new ListCommand(params);
                list.run();
            }

            private runVersionCommand(params: VersionCommandParams) {
                const version = new VersionCommand(params);
                version.run();
            }

            private runFmtCommand(params: FmtCommandParams) {
                const fmt = new FmtCommand(params);
                fmt.run();
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
