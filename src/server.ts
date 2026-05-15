/**
 * @zenformed/core/server — Node / server-only APIs (`node:crypto` for capability payload fingerprints).
 * Do not import from client components or other browser-only bundles.
 */

export type { CapabilityEntitlementResolverDataClient } from './capabilityEntitlementResolverInjection';
export {
  capabilitiesPayloadFingerprint,
  resolveCapabilityEntitlementPayload,
} from './CapabilityEntitlementResolver';
