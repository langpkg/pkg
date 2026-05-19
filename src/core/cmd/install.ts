// src/core/cmd/install.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, isBunBannerLine, isBunStatusMessage,
             cmdCancelled }                   from '../common';

    import { print, createSpinner, theme }    from '../utils/ui';
    import { readFileSync, writeFileSync }    from 'fs';
    import { formatJSON }                     from '@langpkg/mcs_fmt';
    import { spawn }                          from 'child_process';
    import path                               from 'path';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface InstallCommandParams extends CommandParams {
        dynamicArgs? : string[];
        options      : {
            dev?     : boolean;
            peer?    : boolean;
            exact?   : boolean;
            global?  : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class InstallCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: InstallCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Determine install mode ───────────────────────╮

                        const packages =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : [];

                        let command = 'install';
                        const args: string[] = [];

                        if (packages.length === 0) {
                            // Install all dependencies from package.json
                            command = 'install';
                        } else {
                            // Install specific packages
                            command = 'add';
                            args.push(...packages);

                            // Add dependency type options
                            if (this.params.options?.dev) {
                                args.push('--dev');
                            } else if (this.params.options?.peer) {
                                args.push('--peer');
                            }

                            if (this.params.options?.exact) {
                                args.push('--exact');
                            }
                        }

                        // Add global option
                        if (this.params.options?.global) {
                            args.push('--global');
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Show what we're doing ────────────────────────╮

                        const spinner = createSpinner(
                            packages.length === 0
                            ? theme.muted('Installing dependencies...')
                            : theme.muted(`Installing ${packages.length} package(s)...`)
                        );
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 3: Spawn bun install ────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            let hadOutput = false;
                            const installProcess = spawn('bun', [command, ...args], {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            installProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                        hadOutput = true;
                                    }
                                }
                            });

                            installProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            installProcess.on('close', (code) => {
                                spinner.stop();

                                if (code === 0) {
                                    // Format package.json after install
                                    try {
                                        const pkgPath = path.resolve(process.cwd(), 'package.json');
                                        const pkgContent = readFileSync(pkgPath, 'utf-8');
                                        const pkgJson = JSON.parse(pkgContent);
                                        const formatted = formatJSON(JSON.stringify(pkgJson), 'package.json').formatted;
                                        writeFileSync(pkgPath, formatted + '\n');
                                    } catch {
                                        // Formatting error, continue anyway
                                    }

                                    // Add blank line before success message only if there was output
                                    if (hadOutput) {
                                        print.nl();
                                    }

                                    if (packages.length === 0) {
                                        print.success('Dependencies installed!');
                                    } else {
                                        const type = this.params.options?.global
                                        ? 'global'
                                        : this.params.options?.dev
                                        ? 'dev'
                                        : this.params.options?.peer
                                        ? 'peer'
                                        : 'regular';
                                        print.success(`Installed ${packages.length} ${type} package(s)`);
                                    }
                                }

                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            installProcess.on('error', (err) => {
                                spinner.stop();
                                print.error(`Failed to install: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('install'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
