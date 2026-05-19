// src/core/cmd/unlink.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, isBunBannerLine, isBunStatusMessage,
             cmdCancelled }                   from '../common';

    import { print, createSpinner, theme }    from '../utils/ui';
    import { spawn }                          from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface UnlinkCommandParams extends CommandParams {
        dynamicArgs? : string[];
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class UnlinkCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: UnlinkCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Determine unlink mode ────────────────────────╮

                        const packages =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : [];

                        // Check if Bun supports package-specific unlink
                        if (packages.length > 0) {
                            print.error('error: bun unlink {packageName} not implemented yet');
                            print.nl();
                            process.exit(1);
                        }

                        let message: string;

                        if (packages.length === 0) {
                            message = '🔓 Unlinking current package from global...';
                        } else {
                            const count = packages.length;
                            const s = count > 1 ? 's' : '';
                            message = `🔓 Unlinking global package${s} "${packages.join(', ')}" from current project...`;
                        }

                        const spinner = createSpinner(theme.muted(message));
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Spawn bun unlink ─────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            const args = packages.length > 0 ? ['unlink', ...packages] : ['unlink'];

                            const unlinkProcess = spawn('bun', args, {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            unlinkProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                    }
                                }
                            });

                            unlinkProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            unlinkProcess.on('close', (code) => {
                                spinner.stop();

                                if (code === 0) {
                                    if (packages.length === 0) {
                                        print.success('Current package unlinked!');
                                    } else {
                                        print.success(`${packages.length} package(s) unlinked!`);
                                    }
                                }

                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            unlinkProcess.on('error', (err) => {
                                spinner.stop();
                                print.error(`Failed to unlink: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('unlink'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
