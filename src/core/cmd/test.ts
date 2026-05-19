// src/core/cmd/test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, isBunBannerLine, isBunStatusMessage,
             cmdCancelled }    from '../common';

    import { print }           from '../utils/ui';
    import { spawn }           from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface TestCommandParams extends CommandParams {
        dynamicArgs?         : string[];
        options              : {
            watch?           : boolean;
            coverage?        : boolean;
            testNamePattern? : string;
            retry?           : number;
            timeout?         : number;
            bail?            : boolean | number;
            concurrent?      : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class TestCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: TestCommandParams) {}

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    // ╭── Phase 1: Build bun test command ───────────────────────╮

                        const args: string[] = [];

                        // Add options
                        if (this.params.options?.watch) {
                            args.push('--watch');
                        }

                        if (this.params.options?.coverage) {
                            args.push('--coverage');
                        }

                        if (this.params.options?.testNamePattern) {
                            args.push('-t', this.params.options.testNamePattern);
                        }

                        if (this.params.options?.retry !== undefined && this.params.options.retry > 0) {
                            args.push('--retry', String(this.params.options.retry));
                        }

                        if (this.params.options?.timeout !== undefined && this.params.options.timeout > 0) {
                            args.push('--timeout', String(this.params.options.timeout));
                        }

                        if (this.params.options?.bail !== undefined) {
                            if (typeof this.params.options.bail === 'boolean') {
                                args.push('--bail');
                            } else if (this.params.options.bail > 0) {
                                args.push(`--bail=${this.params.options.bail}`);
                            }
                        }

                        if (this.params.options?.concurrent) {
                            args.push('--concurrent');
                        }

                        // Add file patterns if provided
                        const patterns =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : [];
                        if (patterns.length > 0) {
                            args.push(...patterns);
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Spawn test runner ────────────────────────────╮

                        return new Promise<void>((resolve) => {
                            const testProcess = spawn('bun', ['test', ...args], {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            let lastLineWasBlank = false;
                            let hasOutput = false;

                            testProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stdout.write(line + '\n');
                                        lastLineWasBlank = false;
                                        hasOutput = true;
                                    } else if (!isBunBannerLine(line) && !isBunStatusMessage(line) && !line.trim()) {
                                        // Only print blank line if last line wasn't blank and we've had output
                                        if (!lastLineWasBlank && hasOutput) {
                                            process.stdout.write(line + '\n');
                                            lastLineWasBlank = true;
                                        }
                                    }
                                }
                            });

                            testProcess.stderr?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    // Skip bun banner and unnecessary status messages on stderr too
                                    if (!isBunBannerLine(line) && !isBunStatusMessage(line) && line.trim()) {
                                        process.stderr.write(line + '\n');
                                        lastLineWasBlank = false;
                                        hasOutput = true;
                                    } else if (!isBunBannerLine(line) && !isBunStatusMessage(line) && !line.trim()) {
                                        // Only print blank line if last line wasn't blank and we've had output
                                        if (!lastLineWasBlank && hasOutput) {
                                            process.stderr.write(line + '\n');
                                            lastLineWasBlank = true;
                                        }
                                    }
                                }
                            });

                            testProcess.on('close', (code) => {
                                resolve();
                                process.exit(code || 0);
                            });

                            testProcess.on('error', (err) => {
                                print.error(`Failed to run tests: ${err.message}`);
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('test'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
