// src/core/cmd/version.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, cmdCancelled }    from '../common';
    import { print, theme }                   from '../utils/ui';
    import { readFileSync, writeFileSync }    from 'fs';
    import { formatJSON }                     from '@langpkg/mcs_fmt';
    import * as path                          from 'path';
    import * as fs                            from 'fs';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface VersionCommandParams extends CommandParams {
        args       : {
            type?  : string; // 'major', 'minor', 'patch', or version string
        };
        options    : {
            major? : string | number | boolean; // true=increment, number=absolute, string=numeric
            minor? : string | number | boolean; // true=increment, number=absolute, string=numeric
            patch? : string | number | boolean; // true=increment, number=absolute, string=numeric
        };
    }

    interface Version {
        major      : number;
        minor      : number;
        patch      : number;
    }

    type BumpMode = 'increment' | 'absolute' | null;
    interface BumpAction {
        mode       : BumpMode;
        value?     : number;
        type?      : 'major' | 'minor' | 'patch';
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class VersionCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: VersionCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Determine version bump type ──────────────────╮

                        const type = this.params.args?.type;
                        const options = this.params.options || {};

                        // If no input, error
                        if (!type && !options.major && !options.minor && !options.patch) {
                            print.error('Version bump type required: ' + theme.dim('major | minor | patch | <version>'));
                            process.exit(1);
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Read current version from package.json ───────╮

                        const pkgPath = path.resolve(process.cwd(), 'package.json');
                        const pkgContent = readFileSync(pkgPath, 'utf-8');
                        const pkgJson = JSON.parse(pkgContent);
                        const currentVersionStr = pkgJson.version || '0.0.0';
                        const currentVersion = this.parseVersionString(currentVersionStr) || { major: 0, minor: 0, patch: 0 };

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 3: Calculate new version ────────────────────────╮

                        let newVersion: Version = { ...currentVersion };
                        const bumpAction = this.parseBumpAction(this.params.options, this.params.args?.type);

                        if (!bumpAction.mode) {
                            print.error('Version bump type required: ' + theme.dim('major | minor | patch | <version>'));
                            process.exit(1);
                        }

                        if (bumpAction.mode === 'absolute') {
                            // Direct version string or absolute values
                            if (this.params.args?.type && /^\d+\.\d+\.\d+$/.test(this.params.args.type)) {
                                // Parse version string from type arg
                                const parsed = this.parseVersionString(this.params.args.type);
                                if (parsed) {
                                    newVersion = parsed;
                                }
                            } else if (typeof bumpAction.value === 'number' && bumpAction.type) {
                                // Absolute value for specific component
                                const type = bumpAction.type;
                                if (type === 'major') {
                                    newVersion.major = bumpAction.value;
                                } else if (type === 'minor') {
                                    newVersion.minor = bumpAction.value;
                                } else if (type === 'patch') {
                                    newVersion.patch = bumpAction.value;
                                }
                            }
                        } else if (bumpAction.mode === 'increment') {
                            // Increment with carry-over logic
                            const type = bumpAction.type || 'patch'; // Default to patch
                            newVersion = this.incrementVersion(newVersion, type);
                        }

                        const versionString = `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`;

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 4: Update package.json ──────────────────────────╮

                        pkgJson.version = versionString;
                        const formatted = formatJSON(JSON.stringify(pkgJson), 'package.json').formatted;
                        writeFileSync(pkgPath, formatted + '\n');

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 5: Update version badges in docs ────────────────╮

                        this.updateVersionBadges(versionString);

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 6: Success message ──────────────────────────────╮

                        print.success(`Version bumped: ${theme.accent(this.formatVersion(currentVersion))} → ${theme.accent(versionString)}`);
                        print.nl();

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('update'); }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────────── HELPERS ────────────────────────────┐

            private parseOptionValue(opt: string | number | boolean | undefined): { isSet: boolean; value: number | null } {
                // Empty string means option was not specified by CLI parser
                if (opt === undefined || opt === '') return { isSet: false, value: null };
                // true means flag without value (increment mode)
                if (opt === true || opt === 'true') return { isSet: true, value: null };
                // number is absolute value
                if (typeof opt === 'number') return { isSet: true, value: opt };
                // string that's numeric is absolute value
                if (typeof opt === 'string') {
                    const parsed = parseInt(opt, 10);
                    if (!isNaN(parsed)) return { isSet: true, value: parsed };
                }
                return { isSet: false, value: null };
            }

            private parseBumpAction(options: Record<string, string | number | boolean | undefined>, typeArg: string | undefined): BumpAction {
                const majVal = this.parseOptionValue(options.major);
                const minVal = this.parseOptionValue(options.minor);
                const patchVal = this.parseOptionValue(options.patch);

                // Check if any option is set
                if (majVal.isSet) {
                    return { mode: majVal.value !== null ? 'absolute' : 'increment', value: majVal.value ?? undefined, type: 'major' };
                }
                if (minVal.isSet) {
                    return { mode: minVal.value !== null ? 'absolute' : 'increment', value: minVal.value ?? undefined, type: 'minor' };
                }
                if (patchVal.isSet) {
                    return { mode: patchVal.value !== null ? 'absolute' : 'increment', value: patchVal.value ?? undefined, type: 'patch' };
                }

                // Check type argument
                if (typeArg) {
                    if (/^\d+\.\d+\.\d+$/.test(typeArg)) {
                        // Return as absolute version string (handled separately)
                        return { mode: 'absolute', value: undefined, type: undefined };
                    } else if (typeArg === 'major') {
                        return { mode: 'increment', type: 'major' };
                    } else if (typeArg === 'minor') {
                        return { mode: 'increment', type: 'minor' };
                    } else if (typeArg === 'patch') {
                        return { mode: 'increment', type: 'patch' };
                    } else {
                        print.error(`Invalid version bump type: ${typeArg}`);
                        process.exit(1);
                    }
                }

                return { mode: null };
            }

            private incrementVersion(version: Version, type: 'major' | 'minor' | 'patch'): Version {
                if (type === 'major') {
                    version.major += 1;
                    version.minor = 0;
                    version.patch = 0;
                } else if (type === 'minor') {
                    version.minor += 1;
                    // Carry over to major if minor reaches 100
                    if (version.minor >= 100) {
                        version.major += 1;
                        version.minor = 0;
                    }
                    version.patch = 0;
                } else if (type === 'patch') {
                    version.patch += 1;
                    // Carry over to minor if patch reaches 100
                    if (version.patch >= 100) {
                        version.patch = 0;
                        version.minor += 1;
                        // Carry over to major if minor reaches 100
                        if (version.minor >= 100) {
                            version.minor = 0;
                            version.major += 1;
                        }
                    }
                }
                return version;
            }

            private parseVersionString(versionStr: string): Version | null {
                if (/^\d+\.\d+\.\d+$/.test(versionStr)) {
                    const parts = versionStr.split('.').map(Number);
                    return { major: parts[0], minor: parts[1], patch: parts[2] };
                }
                return null;
            }

            private formatVersion(version: Version): string {
                return `${version.major}.${version.minor}.${version.patch}`;
            }

            private updateVersionBadges(newVersion: string) {
                const pattern = /<img data="version" src="https:\/\/img\.shields\.io\/badge\/v-[\d.]+(-[a-zA-Z0-9.]+)?-black"\/>/g;
                const replacement = `<img data="version" src="https://img.shields.io/badge/v-${newVersion}-black"/>`;

                // Update README
                try {
                    const readmePath = path.resolve(process.cwd(), 'README.md');
                    const readmeContent = readFileSync(readmePath, 'utf-8');
                    const updatedReadme = readmeContent.replace(pattern, replacement);
                    writeFileSync(readmePath, updatedReadme);
                } catch {
                    // README might not exist, skip silently
                }

                // Update docs folder files
                try {
                    const docsPath = path.resolve(process.cwd(), 'docs');
                    const walkFiles = (dir: string) => {
                        const files = fs.readdirSync(dir);
                        files.forEach((file: string) => {
                            const filePath = path.join(dir, file);
                            const stat = fs.statSync(filePath);
                            if (stat.isDirectory()) {
                                walkFiles(filePath);
                            } else if (filePath.endsWith('.md')) {
                                try {
                                    const content = fs.readFileSync(filePath, 'utf-8');
                                    const updated = content.replace(pattern, replacement);
                                    if (content !== updated) {
                                        fs.writeFileSync(filePath, updated);
                                    }
                                } catch {
                                    // Ignore errors on individual files
                                }
                            }
                        });
                    };

                    walkFiles(docsPath);
                } catch {
                    // docs folder might not exist, skip silently
                }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
