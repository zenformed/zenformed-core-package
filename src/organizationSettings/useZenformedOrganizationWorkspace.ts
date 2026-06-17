'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  OrganizationInviteCreatePayload,
  OrganizationMemberRoleUpdatePayload,
  OrganizationMemberProfileUpdatePayload,
  OrganizationWorkspaceAppAccessDto,
  OrganizationWorkspaceAppAccessEntryDto,
  OrganizationWorkspaceInviteDto,
  OrganizationWorkspaceMemberDto,
  OrganizationWorkspaceMembershipContextDto,
  OrganizationWorkspaceSeatsDto,
  OrganizationWorkspaceSnapshot,
} from './organizationWorkspaceTypes';
import {
  EMPTY_ORGANIZATION_PERMISSIONS,
  parseOrganizationPermissions,
  resolveOrganizationPermissionsFromRole,
} from './organizationPermissions';
import {
  applyRemovedMemberToSnapshot,
  applyReactivatedMemberToSnapshot,
  filterActiveWorkspaceMembers,
  parseOrganizationWorkspaceMemberDto,
} from './organizationWorkspaceMemberUtils';

type RelayResponse = {
  relay?: string;
  error?: string;
  message?: string;
};

type SliceResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: string };

function sliceLabel(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? url;
}

async function fetchWorkspaceSlice<T>(
  url: string,
  token: string,
  parse: (json: unknown) => T | null
): Promise<SliceResult<T>> {
  const label = sliceLabel(url);
  let res: Response;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    return {
      ok: false,
      reason: `${label}: network error (${e instanceof Error ? e.message : 'fetch failed'})`,
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { ok: false, reason: `${label}: invalid JSON (HTTP ${res.status})` };
  }

  if (!res.ok) {
    const body = json as RelayResponse;
    const detail =
      typeof body.message === 'string'
        ? body.message
        : typeof body.error === 'string'
          ? body.error
          : `HTTP ${res.status}`;
    return { ok: false, reason: `${label}: ${detail}` };
  }

  const body = json as RelayResponse;
  if (body.relay === 'client_supabase_deprecated') {
    return { ok: false, reason: `${label}: Core API not configured` };
  }

  const parsed = parse(json);
  if (parsed == null) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[useZenformedOrganizationWorkspace] parse rejected payload', label, json);
    }
    return { ok: false, reason: `${label}: response shape mismatch` };
  }

  return { ok: true, data: parsed };
}

function parseMembersJson(json: unknown): OrganizationWorkspaceMemberDto[] | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (!Array.isArray(o.members)) return null;
  const members: OrganizationWorkspaceMemberDto[] = [];
  for (const m of o.members) {
    if (m == null || typeof m !== 'object') return null;
    const row = m as Record<string, unknown>;
    if (typeof row.id !== 'string' || typeof row.userId !== 'string') return null;
    if (typeof row.displayName !== 'string') return null;
    if (row.firstName != null && typeof row.firstName !== 'string') return null;
    if (row.lastName != null && typeof row.lastName !== 'string') return null;
    if (row.email != null && typeof row.email !== 'string') return null;
    if (
      row.role !== 'owner' &&
      row.role !== 'admin' &&
      row.role !== 'coordinator' &&
      row.role !== 'member'
    )
      return null;
    if (row.status !== 'active' && row.status !== 'invited' && row.status !== 'removed') return null;
    members.push({
      id: row.id,
      userId: row.userId,
      displayName: row.displayName,
      firstName: typeof row.firstName === 'string' ? row.firstName : null,
      lastName: typeof row.lastName === 'string' ? row.lastName : null,
      email: typeof row.email === 'string' ? row.email : null,
      role: row.role,
      status: row.status,
    });
  }
  return filterActiveWorkspaceMembers(members);
}

function parseInvitesJson(json: unknown): OrganizationWorkspaceInviteDto[] | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (!Array.isArray(o.invites)) return null;
  const invites: OrganizationWorkspaceInviteDto[] = [];
  for (const inv of o.invites) {
    if (inv == null || typeof inv !== 'object') return null;
    const row = inv as Record<string, unknown>;
    if (typeof row.id !== 'string' || typeof row.email !== 'string') return null;
    if (
      row.status !== 'pending' &&
      row.status !== 'accepted' &&
      row.status !== 'revoked' &&
      row.status !== 'expired' &&
      row.status !== 'canceled'
    ) {
      return null;
    }
    if (typeof row.sentLabel !== 'string' || typeof row.createdAt !== 'string') return null;
    if (typeof row.displayName !== 'string') return null;
    if (
      row.emailDeliveryStatus != null &&
      row.emailDeliveryStatus !== 'sent' &&
      row.emailDeliveryStatus !== 'failed'
    ) {
      return null;
    }
    if (
      row.role !== 'owner' &&
      row.role !== 'admin' &&
      row.role !== 'coordinator' &&
      row.role !== 'member'
    )
      return null;
    invites.push({
      id: row.id,
      email: row.email,
      firstName: typeof row.firstName === 'string' ? row.firstName : null,
      lastName: typeof row.lastName === 'string' ? row.lastName : null,
      displayName: row.displayName,
      status: row.status,
      role: row.role,
      invitedBy: typeof row.invitedBy === 'string' ? row.invitedBy : null,
      expiresAt: typeof row.expiresAt === 'string' ? row.expiresAt : null,
      createdAt: row.createdAt,
      sentLabel: row.sentLabel,
      emailDeliveryStatus:
        row.emailDeliveryStatus === 'sent' || row.emailDeliveryStatus === 'failed'
          ? row.emailDeliveryStatus
          : null,
    });
  }
  return invites;
}

function parseSeatsJson(json: unknown): OrganizationWorkspaceSeatsDto | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (typeof o.seatsUsed !== 'number' || typeof o.seatLimit !== 'number') return null;
  if (typeof o.seatsAvailable !== 'number' || typeof o.source !== 'string') return null;
  const appBreakdown: Array<{
    appSlug: string;
    appName: string;
    planCode: string | null;
    entitlementStatus: string;
  }> = [];
  if (Array.isArray(o.appBreakdown)) {
    for (const item of o.appBreakdown) {
      if (item == null || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      if (typeof row.appSlug !== 'string' || typeof row.appName !== 'string') continue;
      appBreakdown.push({
        appSlug: row.appSlug,
        appName: row.appName,
        planCode: typeof row.planCode === 'string' ? row.planCode : null,
        entitlementStatus:
          typeof row.entitlementStatus === 'string' ? row.entitlementStatus : 'unknown',
      });
    }
  }
  return {
    organizationId: o.organizationId,
    seatsUsed: o.seatsUsed,
    seatLimit: o.seatLimit,
    seatsAvailable: o.seatsAvailable,
    source: o.source,
    notes: typeof o.notes === 'string' ? o.notes : null,
    planName: typeof o.planName === 'string' ? o.planName : null,
    appBreakdown,
  };
}

function parseAppAccessJson(json: unknown): OrganizationWorkspaceAppAccessDto | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (!Array.isArray(o.entries) || !Array.isArray(o.orgApps)) return null;

  const entries: OrganizationWorkspaceAppAccessEntryDto[] = [];
  for (const e of o.entries) {
    if (e == null || typeof e !== 'object') return null;
    const row = e as Record<string, unknown>;
    if (typeof row.userId !== 'string' || typeof row.displayName !== 'string') return null;
    if (typeof row.appSlug !== 'string' || typeof row.appName !== 'string') return null;
    entries.push({
      userId: row.userId,
      displayName: row.displayName,
      email: typeof row.email === 'string' ? row.email : null,
      appSlug: row.appSlug,
      appName: row.appName,
      accessStatus: typeof row.accessStatus === 'string' ? row.accessStatus : 'unknown',
      role: typeof row.role === 'string' ? row.role : 'member',
      planLabel: typeof row.planLabel === 'string' ? row.planLabel : null,
    });
  }

  const orgApps: Array<{
    appSlug: string;
    appName: string;
    planLabel: string | null;
    statusLabel: string;
    isActive: boolean;
  }> = [];
  for (const a of o.orgApps) {
    if (a == null || typeof a !== 'object') return null;
    const row = a as Record<string, unknown>;
    if (typeof row.appSlug !== 'string' || typeof row.appName !== 'string') return null;
    if (typeof row.statusLabel !== 'string' || typeof row.isActive !== 'boolean') return null;
    orgApps.push({
      appSlug: row.appSlug,
      appName: row.appName,
      planLabel: typeof row.planLabel === 'string' ? row.planLabel : null,
      statusLabel: row.statusLabel,
      isActive: row.isActive,
    });
  }

  return { organizationId: o.organizationId, entries, orgApps };
}

function parseMembershipContextJson(json: unknown): OrganizationWorkspaceMembershipContextDto | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (typeof o.hasActiveMembership !== 'boolean') return null;
  if (typeof o.hasNonPersonalOrganizationMembership !== 'boolean') return null;
  const membershipKind = o.membershipKind;
  if (
    membershipKind !== 'none' &&
    membershipKind !== 'organization_bootstrap_owner' &&
    membershipKind !== 'invited_member'
  ) {
    return null;
  }
  if (typeof o.currentUserId !== 'string') return null;
  const permissions = parseOrganizationPermissions(o.permissions);
  if (permissions == null) return null;
  const role =
    o.role === 'owner' ||
    o.role === 'admin' ||
    o.role === 'coordinator' ||
    o.role === 'member'
      ? o.role
      : null;
  return {
    hasActiveMembership: o.hasActiveMembership,
    hasNonPersonalOrganizationMembership: o.hasNonPersonalOrganizationMembership,
    membershipKind,
    organizationId: typeof o.organizationId === 'string' ? o.organizationId : null,
    currentUserId: o.currentUserId,
    role,
    permissions: resolveOrganizationPermissionsFromRole(role),
  };
}

export type OrganizationWorkspaceApiUrls = {
  readonly membershipContext: string;
  readonly members: string;
  readonly invites: string;
  readonly seats: string;
  readonly appAccess: string;
  readonly memberRole?: string;
};

export type UseZenformedOrganizationWorkspaceOptions = {
  readonly apiUrls: OrganizationWorkspaceApiUrls;
  readonly getAccessToken: () => string | null | undefined;
  readonly enabled?: boolean;
};

export type UseZenformedOrganizationWorkspaceResult = {
  readonly snapshot: OrganizationWorkspaceSnapshot | null;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly hasLiveData: boolean;
  readonly refetch: () => Promise<void>;
  readonly createInvite: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
  readonly cancelInvite: (inviteId: string) => Promise<boolean>;
  readonly updateMemberRole: (
    memberId: string,
    payload: OrganizationMemberRoleUpdatePayload
  ) => Promise<boolean>;
  readonly removeMember: (memberId: string) => Promise<boolean>;
  readonly updateMemberProfile: (
    memberId: string,
    payload: OrganizationMemberProfileUpdatePayload
  ) => Promise<boolean>;
  readonly isCreatingInvite: boolean;
  readonly cancelingInviteId: string | null;
  readonly updatingMemberRoleId: string | null;
  readonly updatingMemberProfileId: string | null;
  readonly removingMemberId: string | null;
  readonly inviteMutationError: string | null;
  readonly roleMutationError: string | null;
  readonly removeMemberMutationError: string | null;
  readonly memberProfileMutationError: string | null;
  readonly createdInviteAcceptUrl: string | null;
  readonly createdInviteEmailDeliveryStatus: 'sent' | 'failed' | null;
  readonly inviteMutationSuccessMessage: string | null;
  readonly clearCreatedInviteAcceptUrl: () => void;
  readonly clearInviteMutationSuccessMessage: () => void;
};

function readMutationError(json: unknown, fallback: string): string {
  if (json != null && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
  }
  return fallback;
}

export function useZenformedOrganizationWorkspace({
  apiUrls,
  getAccessToken,
  enabled = true,
}: UseZenformedOrganizationWorkspaceOptions): UseZenformedOrganizationWorkspaceResult {
  const [snapshot, setSnapshot] = useState<OrganizationWorkspaceSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(null);
  const [updatingMemberRoleId, setUpdatingMemberRoleId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingMemberProfileId, setUpdatingMemberProfileId] = useState<string | null>(null);
  const [inviteMutationError, setInviteMutationError] = useState<string | null>(null);
  const [roleMutationError, setRoleMutationError] = useState<string | null>(null);
  const [removeMemberMutationError, setRemoveMemberMutationError] = useState<string | null>(null);
  const [memberProfileMutationError, setMemberProfileMutationError] = useState<string | null>(null);
  const [createdInviteAcceptUrl, setCreatedInviteAcceptUrl] = useState<string | null>(null);
  const [createdInviteEmailDeliveryStatus, setCreatedInviteEmailDeliveryStatus] = useState<
    'sent' | 'failed' | null
  >(null);
  const [inviteMutationSuccessMessage, setInviteMutationSuccessMessage] = useState<string | null>(
    null
  );
  const fetchGenerationRef = useRef(0);

  const clearCreatedInviteAcceptUrl = useCallback(() => {
    setCreatedInviteAcceptUrl(null);
    setCreatedInviteEmailDeliveryStatus(null);
  }, []);

  const clearInviteMutationSuccessMessage = useCallback(() => {
    setInviteMutationSuccessMessage(null);
  }, []);

  const fetchAll = useCallback(async () => {
    const token = getAccessToken()?.trim();
    if (!token) {
      setLoadError('Not signed in');
      setHasLiveData(false);
      return;
    }
    const generation = ++fetchGenerationRef.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const contextRes = await fetchWorkspaceSlice(
        apiUrls.membershipContext,
        token,
        parseMembershipContextJson
      );
      if (generation !== fetchGenerationRef.current) return;
      if (!contextRes.ok) {
        setLoadError(contextRes.reason);
        setHasLiveData(false);
        setSnapshot(null);
        return;
      }

      const permissions = contextRes.data.permissions;
      const fetches: Promise<SliceResult<unknown>>[] = [];
      const fetchMembers = permissions.canViewTeamMembers;
      const fetchInvites = permissions.canViewTeamMembers;
      const fetchSeats =
        permissions.canViewTeamMembers || permissions.canViewAppsBilling;
      const fetchAppAccess = permissions.canViewAppsBilling;

      if (fetchMembers) {
        fetches.push(fetchWorkspaceSlice(apiUrls.members, token, parseMembersJson));
      }
      if (fetchInvites) {
        fetches.push(fetchWorkspaceSlice(apiUrls.invites, token, parseInvitesJson));
      }
      if (fetchSeats) {
        fetches.push(fetchWorkspaceSlice(apiUrls.seats, token, parseSeatsJson));
      }
      if (fetchAppAccess) {
        fetches.push(fetchWorkspaceSlice(apiUrls.appAccess, token, parseAppAccessJson));
      }

      const results = await Promise.all(fetches);
      if (generation !== fetchGenerationRef.current) return;
      let membersRes: SliceResult<OrganizationWorkspaceMemberDto[]> | null = null;
      let invitesRes: SliceResult<OrganizationWorkspaceInviteDto[]> | null = null;
      let seatsRes: SliceResult<OrganizationWorkspaceSeatsDto> | null = null;
      let appAccessRes: SliceResult<OrganizationWorkspaceAppAccessDto> | null = null;
      let idx = 0;
      if (fetchMembers) membersRes = results[idx++] as SliceResult<OrganizationWorkspaceMemberDto[]>;
      if (fetchInvites) invitesRes = results[idx++] as SliceResult<OrganizationWorkspaceInviteDto[]>;
      if (fetchSeats) seatsRes = results[idx++] as SliceResult<OrganizationWorkspaceSeatsDto>;
      if (fetchAppAccess) {
        appAccessRes = results[idx++] as SliceResult<OrganizationWorkspaceAppAccessDto>;
      }

      const failures: string[] = [];
      if (membersRes != null && !membersRes.ok) failures.push(membersRes.reason);
      if (invitesRes != null && !invitesRes.ok) failures.push(invitesRes.reason);
      if (seatsRes != null && !seatsRes.ok) failures.push(seatsRes.reason);
      if (appAccessRes != null && !appAccessRes.ok) failures.push(appAccessRes.reason);

      if (failures.length > 0 && process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[useZenformedOrganizationWorkspace] partial load failures', failures);
      }

      setSnapshot({
        membershipContext: contextRes.data,
        members: membersRes?.ok ? membersRes.data : fetchMembers ? [] : null,
        invites: invitesRes?.ok ? invitesRes.data : fetchInvites ? [] : null,
        seats: seatsRes?.ok ? seatsRes.data : null,
        appAccess: appAccessRes?.ok ? appAccessRes.data : null,
      });
      setHasLiveData(true);
    } catch (e) {
      if (generation !== fetchGenerationRef.current) return;
      setLoadError(e instanceof Error ? e.message : 'Failed to load organization data');
      setHasLiveData(false);
    } finally {
      if (generation === fetchGenerationRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiUrls.appAccess, apiUrls.invites, apiUrls.members, apiUrls.membershipContext, apiUrls.seats, getAccessToken]);

  useEffect(() => {
    if (!enabled) return;
    void fetchAll();
  }, [enabled, fetchAll]);

  const createInvite = useCallback(
    async (payload: OrganizationInviteCreatePayload): Promise<boolean> => {
      const token = getAccessToken()?.trim();
      if (!token) {
        setInviteMutationError('Not signed in');
        return false;
      }
      setIsCreatingInvite(true);
      setInviteMutationError(null);
      setCreatedInviteAcceptUrl(null);
      setCreatedInviteEmailDeliveryStatus(null);
      setInviteMutationSuccessMessage(null);
      try {
        const res = await fetch(apiUrls.invites, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setInviteMutationError('Invalid response from server');
          return false;
        }
        if (!res.ok) {
          setInviteMutationError(readMutationError(json, 'Failed to create invite'));
          return false;
        }
        const body = json as Record<string, unknown>;
        if (body.reactivated === true) {
          const message =
            typeof body.message === 'string' && body.message.trim()
              ? body.message.trim()
              : 'Member reactivated successfully.';
          setInviteMutationSuccessMessage(message);
          const reactivatedMember = parseOrganizationWorkspaceMemberDto(body.member);
          if (reactivatedMember != null) {
            setSnapshot((prev) =>
              prev != null ? applyReactivatedMemberToSnapshot(prev, reactivatedMember) : prev
            );
          }
        } else {
          if (typeof body.acceptUrl === 'string' && body.acceptUrl.trim()) {
            setCreatedInviteAcceptUrl(body.acceptUrl.trim());
          }
          if (body.emailDeliveryStatus === 'sent' || body.emailDeliveryStatus === 'failed') {
            setCreatedInviteEmailDeliveryStatus(body.emailDeliveryStatus);
          } else {
            setCreatedInviteEmailDeliveryStatus(null);
          }
        }
        await fetchAll();
        return true;
      } catch (e) {
        setInviteMutationError(e instanceof Error ? e.message : 'Failed to create invite');
        return false;
      } finally {
        setIsCreatingInvite(false);
      }
    },
    [apiUrls.invites, fetchAll, getAccessToken]
  );

  const cancelInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      const token = getAccessToken()?.trim();
      if (!token) {
        setInviteMutationError('Not signed in');
        return false;
      }
      setCancelingInviteId(inviteId);
      setInviteMutationError(null);
      try {
        const res = await fetch(`${apiUrls.invites}/${encodeURIComponent(inviteId)}/cancel`, {
          method: 'PATCH',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setInviteMutationError('Invalid response from server');
          return false;
        }
        if (!res.ok) {
          setInviteMutationError(readMutationError(json, 'Failed to cancel invite'));
          return false;
        }
        await fetchAll();
        return true;
      } catch (e) {
        setInviteMutationError(e instanceof Error ? e.message : 'Failed to cancel invite');
        return false;
      } finally {
        setCancelingInviteId(null);
      }
    },
    [apiUrls.invites, fetchAll, getAccessToken]
  );

  const updateMemberRole = useCallback(
    async (
      memberId: string,
      payload: OrganizationMemberRoleUpdatePayload
    ): Promise<boolean> => {
      const token = getAccessToken()?.trim();
      const roleUrl = apiUrls.memberRole;
      if (!token || roleUrl == null) {
        setRoleMutationError('Not signed in');
        return false;
      }
      setUpdatingMemberRoleId(memberId);
      setRoleMutationError(null);
      try {
        const res = await fetch(`${roleUrl}/${encodeURIComponent(memberId)}/role`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setRoleMutationError('Invalid response from server');
          return false;
        }
        if (!res.ok) {
          setRoleMutationError(readMutationError(json, 'Failed to update member role'));
          return false;
        }
        await fetchAll();
        return true;
      } catch (e) {
        setRoleMutationError(e instanceof Error ? e.message : 'Failed to update member role');
        return false;
      } finally {
        setUpdatingMemberRoleId(null);
      }
    },
    [apiUrls.memberRole, fetchAll, getAccessToken]
  );

  const removeMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      const token = getAccessToken()?.trim();
      if (!token) {
        setRemoveMemberMutationError('Not signed in');
        return false;
      }
      setRemovingMemberId(memberId);
      setRemoveMemberMutationError(null);
      try {
        const res = await fetch(`${apiUrls.members}/${encodeURIComponent(memberId)}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setRemoveMemberMutationError('Invalid response from server');
          return false;
        }
        if (!res.ok) {
          setRemoveMemberMutationError(readMutationError(json, 'Failed to remove member'));
          return false;
        }
        setSnapshot((prev) =>
          prev != null ? applyRemovedMemberToSnapshot(prev, memberId) : prev
        );
        await fetchAll();
        return true;
      } catch (e) {
        setRemoveMemberMutationError(e instanceof Error ? e.message : 'Failed to remove member');
        return false;
      } finally {
        setRemovingMemberId(null);
      }
    },
    [apiUrls.members, fetchAll, getAccessToken]
  );

  const updateMemberProfile = useCallback(
    async (
      memberId: string,
      payload: OrganizationMemberProfileUpdatePayload
    ): Promise<boolean> => {
      const token = getAccessToken()?.trim();
      if (!token) {
        setMemberProfileMutationError('Not signed in');
        return false;
      }
      setUpdatingMemberProfileId(memberId);
      setMemberProfileMutationError(null);
      try {
        const res = await fetch(`${apiUrls.members}/${encodeURIComponent(memberId)}`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setMemberProfileMutationError('Invalid response from server');
          return false;
        }
        if (!res.ok) {
          setMemberProfileMutationError(readMutationError(json, 'Failed to update member profile'));
          return false;
        }
        await fetchAll();
        return true;
      } catch (e) {
        setMemberProfileMutationError(
          e instanceof Error ? e.message : 'Failed to update member profile'
        );
        return false;
      } finally {
        setUpdatingMemberProfileId(null);
      }
    },
    [apiUrls.members, fetchAll, getAccessToken]
  );

  return {
    snapshot,
    isLoading,
    loadError,
    hasLiveData,
    refetch: fetchAll,
    createInvite,
    cancelInvite,
    updateMemberRole,
    removeMember,
    updateMemberProfile,
    isCreatingInvite,
    cancelingInviteId,
    updatingMemberRoleId,
    updatingMemberProfileId,
    removingMemberId,
    inviteMutationError,
    roleMutationError,
    removeMemberMutationError,
    memberProfileMutationError,
    createdInviteAcceptUrl,
    createdInviteEmailDeliveryStatus,
    inviteMutationSuccessMessage,
    clearCreatedInviteAcceptUrl,
    clearInviteMutationSuccessMessage,
  };
}
