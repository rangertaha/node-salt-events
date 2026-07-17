#!/usr/bin/env node
// Test stand-in for salt-call: echoes its arguments back as JSON, or
// misbehaves according to FAKE_SALT_* environment variables.

if (process.env.FAKE_SALT_EXIT) {
  console.error('fake salt-call failure');
  process.exit(Number(process.env.FAKE_SALT_EXIT));
}

if (process.env.FAKE_SALT_SLEEP) {
  // Stay alive long enough for timeout tests to kill us.
  setTimeout(() => {}, Number(process.env.FAKE_SALT_SLEEP));
} else if (process.env.FAKE_SALT_OUTPUT) {
  console.log(process.env.FAKE_SALT_OUTPUT);
} else {
  console.log(JSON.stringify({ argv: process.argv.slice(2) }));
}
