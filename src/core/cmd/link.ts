// src/core/cmd/link.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, isBunBannerLine, isBunStatusMessage,
             cmdCancelled }                   from '../common';

    import { print, createSpinner, theme }    from '../utils/ui';
    import { spawn }                          from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface LinkCommandParams extends CommandParams {
        dynamicArgs? : string[];
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class LinkCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: LinkCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Determine link mode ──────────────────────────╮

                        const packages =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : [];

                        let message: string;

                        if (packages.length === 0) {
                            message = '🔗 Linking current package globally...';
                        } else {
                            const count = packages.length;
                            const s = count > 1 ? 's' : '';
                            message = `🔗 Linking global package${s} "${packages.join(', ')}" to current project...`;
                        }

                        const spinner = createSpinner(theme.muted(message));
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Spawn bun link ───────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            const args = packages.length > 0 ? ['link', ...packages] : ['link'];

                            const linkProcess = spawn('bun', args, {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            linkProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                    }
                                }
                            });

                            linkProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            linkProcess.on('close', (code) => {
                                spinner.stop();

                                if (code === 0) {
                                    if (packages.length === 0) {
                                        print.success('Current package linked globally!');
                                    } else {
                                        print.success(`${packages.length} package(s) linked!`);
                                    }
                                }

                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            linkProcess.on('error', (err) => {
                                spinner.stop();
                                print.error(`Failed to link: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('link'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
