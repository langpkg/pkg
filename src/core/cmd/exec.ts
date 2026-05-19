// src/core/cmd/exec.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, cmdCancelled }    from '../common';
    import { print }                          from '../utils/ui';
    import { spawn }                          from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface ExecCommandParams extends CommandParams {
        args     : {
            code : string;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ExecCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: ExecCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Validate code provided ───────────────────────╮

                        const code = this.params.args?.code;

                        if (!code || code.trim().length === 0) {
                            print.error('❌ Please provide code to execute');
                            print.nl();
                            process.exit(1);
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Spawn bun --eval ─────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            const execProcess = spawn('bun', ['--eval', code], {
                                stdio: 'inherit',
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            execProcess.on('close', (code) => {
                                print.nl();
                                resolve();
                                process.exit(code || 0);
                            });

                            execProcess.on('error', (err) => {
                                print.error(`Failed to execute: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('exec'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝