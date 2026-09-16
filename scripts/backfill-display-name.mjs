/**
 * Backfill de `display_name` en user_metadata a partir de la parte local del email.
 * Equivalente ejecutable de scripts/backfill-display-name.sql vía Admin API.
 *
 *   node --env-file=.env.local scripts/backfill-display-name.mjs          # dry-run
 *   node --env-file=.env.local scripts/backfill-display-name.mjs --apply  # escribe
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const apply = process.argv.includes('--apply');
const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Réplica de initcap(btrim(regexp_replace(local, '[^a-zA-Z0-9]+', ' ', 'g'))) de Postgres.
function displayNameFromEmail(email) {
  return email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\S+/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

async function listAllUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) return users;
  }
}

const users = await listAllUsers();
console.log(`${users.length} usuarios · modo: ${apply ? 'APPLY' : 'dry-run'}\n`);

for (const user of users) {
  if (!user.email) {
    console.log(`- ${user.id}: sin email, se omite`);
    continue;
  }

  const previous = user.user_metadata?.display_name ?? '(sin display_name)';
  const next = displayNameFromEmail(user.email);
  console.log(`- ${user.email}\n    ${previous}  ->  ${next}`);

  if (!apply) continue;

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, display_name: next },
  });
  if (error) {
    console.error(`    ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
