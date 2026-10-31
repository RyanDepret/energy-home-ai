#!/usr/bin/env node
// Hook PostToolUse : après chaque modification de messages/fr.json ou messages/en.json,
// vérifie que les deux fichiers ont les mêmes clés, qu’aucun texte ne contient d’apostrophe
// droite ('), et qu’en français les espaces insécables sont en place avant ? ! ; et après «.
// Sortie 2 + message sur stderr : Claude reçoit le problème et doit le corriger.
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = String(input.tool_input?.file_path ?? input.tool_input?.notebook_path ?? '').split('\\').join('/');
if (!/(^|\/)messages\/(fr|en)\.json$/.test(filePath)) process.exit(0);

const dir = dirname(filePath);
const problems = [];
const MAX = 15; // évite un rapport illisible

function load(lang) {
  try {
    return JSON.parse(readFileSync(join(dir, `${lang}.json`), 'utf8'));
  } catch (e) {
    problems.push(`messages/${lang}.json : JSON invalide ou illisible (${e.message})`);
    return null;
  }
}

// Aplatit l’arbre en { "a.b.0": "texte" }
function flatten(node, prefix = '', out = new Map()) {
  if (node !== null && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else {
    out.set(prefix, node);
  }
  return out;
}

const fr = load('fr');
const en = load('en');

if (fr && en) {
  const f = flatten(fr);
  const e = flatten(en);
  const onlyFr = [...f.keys()].filter((k) => !e.has(k));
  const onlyEn = [...e.keys()].filter((k) => !f.has(k));
  if (onlyFr.length) problems.push(`Clés absentes de en.json (${onlyFr.length}) : ${onlyFr.slice(0, MAX).join(', ')}`);
  if (onlyEn.length) problems.push(`Clés absentes de fr.json (${onlyEn.length}) : ${onlyEn.slice(0, MAX).join(', ')}`);

  for (const [lang, map] of [['fr', f], ['en', e]]) {
    const bad = [...map].filter(([, v]) => typeof v === 'string' && v.includes("'")).map(([k]) => k);
    if (bad.length) problems.push(`Apostrophe droite ' dans ${lang}.json (utiliser ’) : ${bad.slice(0, MAX).join(', ')}`);
  }

  // Espaces insécables acceptées : U+00A0 et U+202F (fine insécable).
  const typo = [];
  for (const [k, v] of f) {
    if (typeof v !== 'string') continue;
    const text = v.replace(/<\/?[a-z]+>/g, ''); // ignore les balises <acc>, <br></br>…
    for (const m of text.matchAll(/(.)([?!;])/g)) {
      if (m[1] !== '\u00A0' && m[1] !== '\u202F' && !/[?!;]/.test(m[1])) {
        typo.push(`${k} (« …${text.slice(Math.max(0, m.index - 12), m.index + 2)} » : espace insécable avant ${m[2]})`);
      }
    }
    for (const m of text.matchAll(/«(.)/g)) {
      if (m[1] !== '\u00A0' && m[1] !== '\u202F') {
        typo.push(`${k} (« …${text.slice(m.index, m.index + 14)} » : espace insécable après «)`);
      }
    }
  }
  if (typo.length) problems.push(`Typographie française dans fr.json (${typo.length}) :\n  - ${typo.slice(0, MAX).join('\n  - ')}`);
}

if (problems.length) {
  console.error(`Vérification des messages (${basename(filePath)}) — à corriger :\n- ${problems.join('\n- ')}`);
  process.exit(2);
}
process.exit(0);
