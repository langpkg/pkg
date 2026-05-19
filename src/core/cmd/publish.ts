// src/core/cmd/publish.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, isBunBannerLine, isBunStatusMessage,
             cmdCancelled }                   from '../common';

    import { print, createSpinner, theme }    from '../utils/ui';
    import { spawn }                          from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface PublishCommandParams extends CommandParams {
        options     : {
            tag?    : string;
            public? : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class PublishCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: PublishCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Build publish command ────────────────────────╮

                        const args: string[] = ['publish'];

                        if (this.params.options?.tag) {
                            args.push('--tag', this.params.options.tag);
                        }

                        // Always set access to public (default)
                        args.push('--access', 'public');

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Show what we're doing ────────────────────────╮

                        const message = this.params.options?.tag
                        ? `📦 Publishing as "${this.params.options.tag}"...`
                        : '📦 Publishing package...';
                        const spinner = createSpinner(theme.muted(message));
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 3: Spawn bun publish ────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            const publishProcess = spawn('bun', args, {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            publishProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                    }
                                }
                            });

                            publishProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            publishProcess.on('close', (code) => {
                                spinner.stop();

                                if (code === 0) {
                                    print.success('Package published successfully!');
                                }

                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            publishProcess.on('error', (err) => {
                                spinner.stop();
                                print.error(`Failed to publish: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('publish'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
