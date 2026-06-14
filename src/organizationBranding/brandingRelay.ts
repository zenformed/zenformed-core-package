export type BrandingRelayBody = {
  readonly relay?: string;
  readonly error?: string;
};

export function parseBrandingRelayBody(body: unknown): BrandingRelayBody {
  if (body == null || typeof body !== 'object') return {};
  const record = body as Record<string, unknown>;
  return {
    relay: typeof record.relay === 'string' ? record.relay : undefined,
    error: typeof record.error === 'string' ? record.error : undefined,
  };
}

export function isBrandingRelayUnreachable(
  response: Pick<Response, 'status'>,
  body: BrandingRelayBody
): boolean {
  if (body.relay === 'client_supabase_deprecated') return false;
  if (body.error === 'zenformed_core_unreachable') return true;
  if (body.error === 'branding_unavailable') return true;
  if (response.status === 502) return true;
  return false;
}
