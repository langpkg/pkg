// src/core/cmd/list.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, isBunBannerLine, isBunStatusMessage,
             cmdCancelled }    from '../common';

    import { print }           from '../utils/ui';
    import { spawn }           from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface ListCommandParams extends CommandParams {
        options     : {
            global? : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ListCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: ListCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Build list command ───────────────────────────╮

                        const args: string[] = ['pm', 'ls'];

                        if (this.params.options?.global) {
                            args.push('--global');
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Spawn bun pm ls ──────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            const listProcess = spawn('bun', args, {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            listProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                    }
                                }
                            });

                            listProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                    }
                                }
                            });

                            listProcess.on('close', (code) => {
                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            listProcess.on('error', (err) => {
                                print.error(`Failed to list packages: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('list'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
