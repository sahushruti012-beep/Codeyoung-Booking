import test from 'node:test';
import assert from 'node:assert/strict';
import { parseParentLocalTime, validTimeZone } from '../src/time.js';

test('accepts a valid IANA time zone and local time', () => {
  assert.equal(validTimeZone('Asia/Kolkata'), true);
  const value = parseParentLocalTime('2027-01-15T10:30', 'America/New_York');
  assert.equal(value.isValid, true);
});

test('rejects invalid time zone', () => {
  assert.throws(() => parseParentLocalTime('2027-01-15T10:30', 'Not/AZone'), /valid time zone/);
});

test('rejects nonexistent DST local time', () => {
  // New York jumps from 01:59 to 03:00 on this date.
  assert.throws(() => parseParentLocalTime('2027-03-14T02:30', 'America/New_York'), /daylight-saving/);
});
