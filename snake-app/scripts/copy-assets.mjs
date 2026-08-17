/**
 * copy-assets.mjs — Script to sync web assets from root project into snake-app/www/
 *
 * Run this from inside snake-app/ after making changes to the root game files:
 *   node scripts/copy-assets.mjs
 *
 * Then run: npx cap sync android
 */
import { cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');   // pythonic/
const WWW  = join(__dirname, '..', 'www'); // snake-app/www/

mkdirSync(WWW, { recursive: true });

const filesToCopy = [
  ['styles.css',   'styles.css'],
  ['game.js',      'game.js'],
];

const dirsToCopy = [
  ['src/scoring.js',      'src/scoring.js'],
  ['src/leaderboard.js',  'src/leaderboard.js'],
  ['src/tutorial.js',     'src/tutorial.js'],
  ['src/vitals.js',       'src/vitals.js'],
];

const srcDirsToCopy = [
  'src/audio',
  'src/ai',
  'src/quests',
  'src/share',
  'src/skins',
];

// Copy flat files from root
for (const [src, dest] of filesToCopy) {
  cpSync(join(ROOT, src), join(WWW, dest), { force: true });
  console.log(`  ✓ ${src} → www/${dest}`);
}

// Copy individual module files from root/src
for (const [src, dest] of dirsToCopy) {
  cpSync(join(ROOT, src), join(WWW, dest), { force: true });
  console.log(`  ✓ ${src} → www/${dest}`);
}

// Copy module directories from root/src
for (const dir of srcDirsToCopy) {
  cpSync(join(ROOT, dir), join(WWW, dir), { recursive: true, force: true });
  console.log(`  ✓ ${dir}/ → www/${dir}/`);
}

// Note: snake-app-specific files (index.html, app-mobile.css, game-native.js, src/native/)
// are already in www/ and should NOT be overwritten from root
console.log('\n✅ Assets synced to www/. Run: npx cap sync android');
