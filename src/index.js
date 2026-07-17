import { execFile } from 'node:child_process';

const DEFAULTS = {
  saltCall: 'salt-call',
  sudo: false,
  timeout: 30_000,
};

function fire(fn, data, tag, options = {}) {
  if (typeof tag !== 'string' || tag.length === 0) {
    return Promise.reject(new TypeError('tag must be a non-empty string'));
  }

  const { saltCall, sudo, timeout } = { ...DEFAULTS, ...options };
  const args = ['--out', 'json', fn, JSON.stringify(data), tag];
  const command = sudo ? 'sudo' : saltCall;
  const commandArgs = sudo ? [saltCall, ...args] : args;

  return new Promise((resolve, reject) => {
    execFile(command, commandArgs, { timeout }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Fire an event on the local minion event bus (`salt-call event.fire`).
 *
 * @param {unknown} data - JSON-serializable event payload.
 * @param {string} tag - Event tag, e.g. `'myapp/deploy/done'`.
 * @param {object} [options]
 * @param {string} [options.saltCall='salt-call'] - Path to the salt-call executable.
 * @param {boolean} [options.sudo=false] - Run salt-call through sudo.
 * @param {number} [options.timeout=30000] - Kill salt-call after this many milliseconds.
 * @returns {Promise<unknown>} Parsed JSON output from salt-call, or raw trimmed
 *   stdout if the output is not valid JSON.
 */
export function local(data, tag, options) {
  return fire('event.fire', data, tag, options);
}

/**
 * Fire an event on the master event bus (`salt-call event.fire_master`).
 *
 * Runs through sudo by default because fire_master needs access to the
 * minion's keys; pass `{ sudo: false }` when running as root or when the
 * invoking user already has the required permissions.
 *
 * @param {unknown} data - JSON-serializable event payload.
 * @param {string} tag - Event tag, e.g. `'myapp/deploy/done'`.
 * @param {object} [options]
 * @param {string} [options.saltCall='salt-call'] - Path to the salt-call executable.
 * @param {boolean} [options.sudo=true] - Run salt-call through sudo.
 * @param {number} [options.timeout=30000] - Kill salt-call after this many milliseconds.
 * @returns {Promise<unknown>} Parsed JSON output from salt-call, or raw trimmed
 *   stdout if the output is not valid JSON.
 */
export function master(data, tag, options) {
  return fire('event.fire_master', data, tag, { sudo: true, ...options });
}
