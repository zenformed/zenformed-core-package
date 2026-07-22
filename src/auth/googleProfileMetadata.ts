export type GoogleProfileNameFields = {
  readonly firstName: string | null;
  readonly lastName: string | null;
};

function readTrimmed(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function splitFullName(fullName: string): GoogleProfileNameFields {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Maps common Supabase Google user_metadata keys into first/last name.
 * Prefer given_name / family_name; fall back to full_name / name.
 */
export function extractGoogleProfileNames(
  userMetadata: Record<string, unknown> | null | undefined
): GoogleProfileNameFields {
  if (userMetadata == null) return { firstName: null, lastName: null };

  const given = readTrimmed(userMetadata.given_name);
  const family = readTrimmed(userMetadata.family_name);
  if (given || family) {
    return { firstName: given, lastName: family };
  }

  const fullName = readTrimmed(userMetadata.full_name) ?? readTrimmed(userMetadata.name);
  if (fullName) return splitFullName(fullName);

  return { firstName: null, lastName: null };
}

/**
 * Fills missing profile names from Google metadata without overwriting existing non-empty values.
 */
export function mergeProfileNamesFromGoogle(input: {
  readonly existingFirstName: string | null | undefined;
  readonly existingLastName: string | null | undefined;
  readonly userMetadata: Record<string, unknown> | null | undefined;
}): { readonly firstName: string | null; readonly lastName: string | null; readonly changed: boolean } {
  const existingFirst = readTrimmed(input.existingFirstName);
  const existingLast = readTrimmed(input.existingLastName);
  const fromGoogle = extractGoogleProfileNames(input.userMetadata);

  const firstName = existingFirst ?? fromGoogle.firstName;
  const lastName = existingLast ?? fromGoogle.lastName;
  const changed =
    (existingFirst == null && firstName != null) || (existingLast == null && lastName != null);

  return { firstName, lastName, changed };
}
