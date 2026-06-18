import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getUserInitials, resolveInitialsFromLabel } from './accountMenuUtils';

describe('accountMenuUtils initials', () => {
  it('uses first and last name when available', () => {
    assert.equal(
      getUserInitials({
        email: 'djhindu17@gmail.com',
        firstName: 'Daniel',
        lastName: 'Henderson',
      }),
      'DH'
    );
  });

  it('parses display name when first and last are missing', () => {
    assert.equal(
      getUserInitials(
        {
          email: 'djhindu17@gmail.com',
        },
        'Daniel Henderson'
      ),
      'DH'
    );
  });

  it('falls back to email local-part only when no name is available', () => {
    assert.equal(
      getUserInitials({
        email: 'djhindu17@gmail.com',
      }),
      'DJ'
    );
  });

  it('resolves initials from assignee labels', () => {
    assert.equal(resolveInitialsFromLabel('Daniel Henderson'), 'DH');
    assert.equal(resolveInitialsFromLabel('djhindu17@gmail.com'), 'DJ');
  });
});
