// src/core/cmd/update.ts
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

    export interface UpdateCommandParams extends CommandParams {
        dynamicArgs?     : string[];
        options          : {
            interactive? : boolean;
            latest?      : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class UpdateCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: UpdateCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Build update command ─────────────────────────╮

                        const packages =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : [];

                        const args: string[] = [];

                        // Add options
                        if (this.params.options?.interactive) {
                            args.push('--interactive');
                        }

                        if (this.params.options?.latest) {
                            args.push('--latest');
                        }

                        // Add packages if specified
                        if (packages.length > 0) {
                            args.push(...packages);
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Show what we're doing ────────────────────────╮

                        const spinner = createSpinner(
                            packages.length === 0
                            ? theme.muted('Updating all packages...')
                            : theme.muted(`Updating ${packages.length} package(s)...`)
                        );
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 3: Spawn bun update ─────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            let hadOutput = false;
                            const updateProcess = spawn('bun', ['update', ...args], {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            updateProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                        hadOutput = true;
                                    }
                                }
                            });

                            updateProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            updateProcess.on('close', (code) => {
                                spinner.stop();

                                if (code === 0) {
                                    // Format package.json after update
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
                                        print.success('All packages updated!');
                                    } else {
                                        print.success(`Updated ${packages.length} package(s)`);
                                    }
                                }

                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            updateProcess.on('error', (err) => {
                                spinner.stop();
                                print.error(`Failed to update: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('update'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
