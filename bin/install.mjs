#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const USAGE = `Usage: magic-agent-skills [options]

Installs skills and subagents globally (~/.claude, ~/.config/opencode) with Rulesync.
Without --skill / --subagent, everything is installed.

Options:
  --skill <name>      Install only this skill (repeatable)
  --subagent <name>   Install only this subagent (repeatable)
  --list              List available skills and subagents
  --dry-run           Show what would be written without writing
  -h, --help          Show this help`;

const { values } = parseArgs({
  options: {
    skill: { type: "string", multiple: true, default: [] },
    subagent: { type: "string", multiple: true, default: [] },
    list: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(USAGE);
  process.exit(0);
}

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = (root) => join(root, ".rulesync", "skills");
const subagentsDir = (root) => join(root, ".rulesync", "subagents");

const listSkills = (root) => readdirSync(skillsDir(root));
const listSubagents = (root) =>
  readdirSync(subagentsDir(root)).map((f) => parse(f).name);

if (values.list) {
  console.log(`Skills:\n${listSkills(pkgRoot).map((s) => `  ${s}`).join("\n")}`);
  console.log(`Subagents:\n${listSubagents(pkgRoot).map((s) => `  ${s}`).join("\n")}`);
  process.exit(0);
}

// `rulesync` does not export its package.json, so walk up node_modules instead of using require.resolve.
const findRulesync = (from) => {
  for (let dir = from; ; dir = dirname(dir)) {
    for (const candidate of [join(dir, "node_modules", "rulesync"), join(dir, "rulesync")]) {
      if (existsSync(join(candidate, "package.json"))) return join(candidate, "package.json");
    }
    if (dirname(dir) === dir) return undefined;
  }
};

const fail = (message) => {
  console.error(`error: ${message}`);
  process.exit(1);
};

const filtered = values.skill.length > 0 || values.subagent.length > 0;
for (const name of values.skill) {
  if (!listSkills(pkgRoot).includes(name)) fail(`unknown skill "${name}" (see --list)`);
}
for (const name of values.subagent) {
  if (!listSubagents(pkgRoot).includes(name)) fail(`unknown subagent "${name}" (see --list)`);
}

// Rulesync reads from `<input-root>/.rulesync`, so generate from a filtered copy.
const workDir = mkdtempSync(join(tmpdir(), "magic-agent-skills-"));
try {
  cpSync(join(pkgRoot, ".rulesync"), join(workDir, ".rulesync"), { recursive: true });
  cpSync(join(pkgRoot, "rulesync.jsonc"), join(workDir, "rulesync.jsonc"));

  if (filtered) {
    for (const name of listSkills(workDir)) {
      if (!values.skill.includes(name)) rmSync(join(skillsDir(workDir), name), { recursive: true });
    }
    for (const file of readdirSync(subagentsDir(workDir))) {
      if (!values.subagent.includes(parse(file).name)) rmSync(join(subagentsDir(workDir), file));
    }
  }

  const rulesyncPkg = findRulesync(pkgRoot);
  if (!rulesyncPkg) fail("rulesync not found, reinstall the package");
  const { bin } = JSON.parse(readFileSync(rulesyncPkg, "utf8"));
  const cli = join(dirname(rulesyncPkg), typeof bin === "string" ? bin : bin.rulesync);
  if (!existsSync(cli)) fail("rulesync CLI not found, reinstall the package");

  // Only generate features that exist, otherwise rulesync warns about each missing file.
  const features = ["skills", "subagents"].filter((f) => readdirSync(join(workDir, ".rulesync", f)).length > 0);
  if (features.length === 0) fail("nothing to install");

  const args = [cli, "generate", "--global", "--input-root", workDir, "--features", features.join(",")];
  if (values["dry-run"]) args.push("--dry-run");
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
