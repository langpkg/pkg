// src/core/cmd/uninstall.ts
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

    export interface UninstallCommandParams extends CommandParams {
        dynamicArgs? : string[];
        options      : {
            global?  : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class UninstallCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: UninstallCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Validate packages provided ───────────────────╮

                        const packages =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : [];

                        if (packages.length === 0) {
                            print.error('❌ Please specify at least one package to uninstall');
                            print.nl();
                            process.exit(1);
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Build remove command ─────────────────────────╮

                        const args: string[] = ['remove'];

                        if (this.params.options?.global) {
                            args.push('--global');
                        }

                        args.push(...packages);

                        const isGlobal = this.params.options?.global ? ' globally' : '';
                        const message = `🗑️ Uninstalling ${packages.length > 1 ? packages.length + ' ' : ''}package(s)${isGlobal}...`;
                        const spinner = createSpinner(theme.muted(message));
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 3: Spawn bun remove ─────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            let hadOutput = false;
                            const removeProcess = spawn('bun', args, {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            removeProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                        hadOutput = true;
                                    }
                                }
                            });

                            removeProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            removeProcess.on('close', (code) => {
                                spinner.stop();

                                if (code === 0) {
                                    // Format package.json after uninstall
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
                                    print.success(`Uninstalled ${packages.length} package(s)!`);
                                }

                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            removeProcess.on('error', (err) => {
                                spinner.stop();
                                print.error(`Failed to remove: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('uninstall'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
