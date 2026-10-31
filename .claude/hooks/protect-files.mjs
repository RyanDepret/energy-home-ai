#!/usr/bin/env node
// Hook PreToolUse : protège les fichiers sensibles.
// - src/lib/dpe.ts (seuils DPE 2026) : modification refusée, sauf si le fichier .claude/autoriser-dpe
//   existe. Ce fichier est créé par l’utilisateur lui-même (ignoré par Git) ; Claude ne peut pas le
//   créer (sinon il pourrait se débloquer seul), mais peut le supprimer.
//   (Une confirmation « ask » ne suffit pas : en auto mode, elle n’est pas affichée.)
// - .env, .env.local, .env.production… : modification refusée (seul .env.example reste modifiable).
// Couvre les outils d’édition (Edit, Write, MultiEdit, NotebookEdit) et, de façon heuristique,
// les commandes Bash / PowerShell qui écrivent dans ces fichiers.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const dpeUnlocked = existsSync(join(projectDir, '.claude', 'autoriser-dpe'));

const isDpe = (p) => /(^|\/)src\/lib\/dpe\.ts$/.test(p);
const isAuth = (p) => /(^|\/)\.claude\/autoriser-dpe$/.test(p);
const isEnv = (p) => {
  const name = p.split('/').pop() ?? '';
  return name.startsWith('.env') && name !== '.env.example';
};

function decide(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason },
  }));
  process.exit(0);
}

const ENV_REASON = 'Les fichiers .env* (hors .env.example) contiennent des secrets et ne doivent pas être modifiés par Claude. Modifie-les toi-même.';
const DPE_REASON = 'src/lib/dpe.ts contient les seuils DPE de la réforme 2026 et est verrouillé. Pour autoriser une modification (avec une source officielle), l’utilisateur doit créer lui-même le fichier .claude/autoriser-dpe, puis le supprimer ensuite.';
const AUTH_REASON = 'Seul l’utilisateur peut créer .claude/autoriser-dpe (c’est ce fichier qui déverrouille src/lib/dpe.ts). Claude peut seulement le supprimer.';

if (tool === 'Bash' || tool === 'PowerShell') {
  let cmd = String(ti.command ?? '').split('\\').join('/');
  // Le texte d’un heredoc (message de commit, etc.) n’est pas une commande : on l’ignore.
  // (on garde la fin de la ligne d’ouverture, qui peut contenir une redirection : cat <<EOF > .env)
  cmd = cmd.replace(/<<-?\s*['"]?(\w+)['"]?([^\n]*)\n[\s\S]*?\n\s*\1\s*(?=\n|$)/g, '$2');
  // Un fichier n’est considéré comme modifié que s’il est la cible d’une redirection,
  // ou s’il apparaît dans le même segment (entre ; | & ou retour à la ligne) qu’une commande d’écriture.
  const WRITE_CMD = /(\bsed\s+(-[a-zA-Z]+\s+)*-i|\btee\b|\b(cp|mv|rm|touch|truncate|install)\b|Set-Content|Add-Content|Out-File|Clear-Content|Remove-Item|Move-Item|Copy-Item|New-Item|Rename-Item|WriteAll(Text|Lines|Bytes))/i;
  const ENV_FILE = String.raw`\.env(?!\.example\b)(?![\w.-]*\.example\b)[\w.-]*`;
  const DPE_FILE = String.raw`dpe\.ts\b`;
  const touches = (file) => {
    if (new RegExp(String.raw`>{1,2}\s*["']?[^\s"'|;&]*` + file).test(cmd)) return true;
    return cmd.split(/[;|&\n]+/).some((seg) => WRITE_CMD.test(seg) && new RegExp(String.raw`(^|[\s"'/])` + file).test(seg));
  };
  if (touches(ENV_FILE)) decide('deny', ENV_REASON);
  if (!dpeUnlocked && touches(DPE_FILE)) decide('deny', DPE_REASON);
  // Création de .claude/autoriser-dpe : refusée ; une simple suppression (rm / Remove-Item) reste permise.
  // Chaque segment est jugé séparément : lire le fichier (ls, git check-ignore…) ou le supprimer est permis.
  const isDelete = (seg) => /^\s*(rm|Remove-Item|del)\b/i.test(seg) && !/>/.test(seg);
  const createsAuth = /autoriser-dpe/.test(cmd) && (
    /[>]{1,2}\s*["']?[^\s"'|;&]*autoriser-dpe\b/.test(cmd)
    || cmd.split(/[;|&\n]+/).some((seg) => /autoriser-dpe/.test(seg) && WRITE_CMD.test(seg) && !isDelete(seg))
  );
  if (createsAuth) decide('deny', AUTH_REASON);
  process.exit(0);
}

const path = String(ti.file_path ?? ti.notebook_path ?? '').split('\\').join('/');
if (!path) process.exit(0);
if (isEnv(path)) decide('deny', ENV_REASON);
if (isAuth(path)) decide('deny', AUTH_REASON);
if (isDpe(path) && !dpeUnlocked) decide('deny', DPE_REASON);
process.exit(0);
