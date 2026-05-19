// src/core/cmd/init.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { sleep, CommandParams, cmdCancelled }        from '../common';
    import { print, createSpinner, theme }               from '../utils/ui';
    import { generateFile, ProjectType, ProjectMeta }    from '@langpkg/mcs_gen';
    import { input, select }                             from '@inquirer/prompts';
    import * as path                                     from 'path';
    import * as fs                                       from 'fs';
    import process                                       from 'process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface InitCommandParams extends CommandParams {
        args      : {
            name? : string;       // package name (optional - prompted if not passed)
        };

        options   : {
            dir?  : string;       // use this dir directly instead of <dir>/<name>
            as?   : ProjectType;  // project type: 'cli' or 'normal' (prompted if not passed)
            yes?  : boolean;      // skip prompts, use all defaults (-y)
        };
    }

    interface ParsedName {
        full      : string;       // exactly as entered  e.g. "@langpkg/cli" or "mycli"
        org       : string;       // "langpkg"           or ""  (no leading @)
        repo      : string;       // "cli"               or "mycli"
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class InitCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: InitCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    const useYes = this.params.options?.yes ?? false;
                    const useDir = !!this.params.options?.dir;

                    // ╭── Phase 1: Resolve package name ─────────────────────────╮

                        // Package name can be passed as argument or prompted
                        const rawName =
                        this.params.args.name?.trim() ||
                        (await input({
                            message     : theme.muted('Package name  (e.g. @org/repo  or  myrepo):'),
                            validate    : (v: string) => (v.trim() ? true : 'Package name cannot be empty.'),
                        }));

                        if (!rawName?.trim()) {
                            print.error('Package name cannot be empty.');
                            print.nl();
                            return;
                        }

                        const packageName   = rawName.trim();
                        const parsed        = this.parseName(packageName);
                        const nameWasPassed = !!this.params.args.name?.trim();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Resolve target directory ─────────────────────╮

                        // name passed as arg  → create <repo> subfolder inside baseDir (or --dir path)
                        // name was prompted   → init in-place (baseDir or --dir path as-is)
                        const baseDir = useDir
                        ? path.resolve(this.params.options!.dir!)
                        : path.resolve(process.cwd());
                        const targetDir = nameWasPassed ? path.join(baseDir, parsed.repo) : baseDir;

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 4: Guard - already initialised? ─────────────────╮

                        const blockers = ['package.json'].filter((f) => fs.existsSync(path.join(targetDir, f)));

                        if (blockers.length) {
                            print.error(`Directory already contains: ${blockers.join(', ')}`);
                            print.nl();
                            print.info( 'Clean the directory first, or use ' + theme.accent('--dir <dir>') + ' to create the project inside another folder.' );
                            print.nl();
                            return;
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 4: Resolve project type ─────────────────────────╮

                        // Type can be passed via --as option or will be prompted
                        let projectType = this.params.options?.as;
                        if (!projectType) {
                            if (useYes) {
                                print.error('Flag -y requires a project type  →  pkg init <name> --as cli -y');
                                print.nl();
                                return;
                            }

                            projectType = await select({
                                message: theme.muted('Select project type:'),
                                choices: [
                                    { name: 'Normal Package',   value: 'pkg' },
                                    { name: 'CLI Package',      value: 'cli' },
                                ],
                            });
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 5: Gather metadata ──────────────────────────────╮

                        const meta = useYes
                        ? this.buildDefaultMetaFromPackageName(parsed, packageName)
                        : await this.promptMeta(parsed, projectType);

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 6: Create structure ─────────────────────────────╮

                        const spinner = createSpinner(theme.muted('Creating project structure...'));
                        spinner.start();
                        await sleep(400);

                        this.createDirectories(targetDir, projectType);

                        spinner.stop();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 7: Generate files ───────────────────────────────╮

                        const fileSpinner = createSpinner(theme.muted('Generating files...'));
                        fileSpinner.start();
                        await sleep(400);

                        this.generateFiles(targetDir, meta, projectType);

                        fileSpinner.stop();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 8: Success ──────────────────────────────────────╮

                        const relDir = path.relative(process.cwd(), targetDir) || '.';

                        print.success(`Project '${meta.name}' initialized as '${projectType}' mode`);
                        print.info(`Location: ${theme.accent(targetDir)}`);
                        print.nl();
                        print.section('next steps');
                        print.info(`1. cd ${theme.accent(relDir)}`);
                        print.info('2. Install dependencies with ' + theme.accent('pkg install'));
                        print.info('3. Start editing ' + theme.accent('src/index.ts'));
                        print.info('4. Run ' + theme.accent('pkg build') + ' to build the project');
                        print.nl();

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('init'); }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private parseName(raw: string): ParsedName {
                if (raw.startsWith('@') && raw.includes('/')) {
                    const slash = raw.indexOf('/');
                    return {
                        full    : raw,
                        org     : raw.slice(1, slash),  // strip leading @  →  "langpkg"
                        repo    : raw.slice(slash + 1), // "cli"
                    };
                }
                return {
                    full        : raw,
                    org         : '',
                    repo        : raw
                };
            }

            private buildDefaultMetaFromPackageName(parsed: ParsedName, packageName: string): ProjectMeta {
                return {
                    name        : packageName,
                    version     : '0.0.1',
                    description : '',
                    license     : 'MIT',
                    author      : { name: '', email: '', github: '' },
                    org         : parsed.org,
                    repoName    : parsed.repo,
                };
            }

            private async promptMeta(parsed: ParsedName, _projectType: ProjectType): Promise<ProjectMeta> {

                // ── Package ─────────────────────────────────────────────────

                const name = parsed.full; // Package name is already determined from the argument

                const description = await input({
                    message : theme.muted('Description:'),
                    default : '',
                });

                const version = await input({
                    message : theme.muted('Version:'),
                    default : '0.0.1',
                });

                const license = await input({
                    message : theme.muted('License:'),
                    default : 'MIT',
                });

                // ── Author ──────────────────────────────────────────────────

                const authorRaw = await input({
                    message : theme.muted('Author:'),
                    default : '',
                    validate: (v: string) => {
                        if (!v.trim()) return true; // all fields are optional
                        const parts = v.split(',');
                        if (parts.length !== 3) { return 'Expected exactly 3 values: Name, Email, GitHubUser'; }
                        return true;
                    },
                });

                const [authorName = '', authorEmail = '', authorGithub = ''] = authorRaw
                .split(',')
                .map((s: string) => s.trim());

                // ── Repository ──────────────────────────────────────────────

                const org = await input({
                    message : theme.muted('GitHub org (leave blank to use your username):'),
                    default : parsed.org || authorGithub,
                });

                const repoName = await input({
                    message : theme.muted('Repository name:'),
                    default : parsed.repo,
                });

                print.nl();

                // ── Return ──────────────────────────────────────────────────

                return {
                    name,
                    version,
                    description,
                    license,
                    author      : {
                        name    : authorName,
                        email   : authorEmail,
                        github  : authorGithub,
                    },
                    org         : org || authorGithub,
                    repoName    : repoName,
                };

            }

            private createDirectories(targetDir: string, _projectType: ProjectType) {

                // MCS Convention
                //
                // Single-word  : lowercase (src, test, core, docs)
                // Multi-word   : snake_case (user_handlers, config_loaders)
                // Exceptions   : Special names use UPPER_CASE or PascalCase (CMD/, MCS/, API/)
                // See docs/cmd/fmt.md for complete naming convention rules

                const mk = (rel: string) => {
                    const full = path.join(targetDir, rel);
                    fs.mkdirSync(full, { recursive: true });
                };

                const touch = (rel: string) => {
                    const full = path.join(targetDir, rel);
                    if (!fs.existsSync(full)) fs.writeFileSync(full, '', 'utf-8');
                };

                mk('.vscode');
                mk('assets/img');
                mk('docs');
                mk('src');
                mk('test');

                touch('test/.gitkeep');

            }

            private generateFiles(targetDir: string, meta: ProjectMeta, projectType: ProjectType) {

                const write = (rel: string, content: string) => {
                    const full = path.join(targetDir, rel);
                    const dir  = path.dirname(full);

                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(full, content, 'utf-8');
                };

                // ── Root config ─────────────────────────────────────────────

                write('package.json',           generateFile('package.json',          projectType, meta));
                write('tsconfig.json',          generateFile('tsconfig.json',         projectType, meta));
                write( 'eslint.config.mjs',     generateFile('eslint.config.mjs',     projectType, meta) );
                write('tsup.config.ts',         generateFile('tsup.config.ts',        projectType, meta));
                write('LICENSE',                generateFile('LICENSE',               projectType, meta));
                write('README.md',              generateFile('README.md',             projectType, meta));
                write('.gitignore',             generateFile('.gitignore',            projectType, meta));
                write( '.vscode/settings.json', generateFile('.vscode/settings.json', projectType, meta) );

                // ── Source files ────────────────────────────────────────────

                write('src/index.ts',           generateFile('src/index.ts',          projectType, meta));
                write( 'test/index.test.ts',    generateFile('test/index.test.ts',    projectType, meta) );

                // ── Docs ────────────────────────────────────────────────────

                const gitkeep = path.join(targetDir, 'docs/.gitkeep');
                if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '', 'utf-8');

            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
