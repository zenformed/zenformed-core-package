'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  OrganizationWorkspaceAppAccessDto,
  OrganizationWorkspaceInviteDto,
  OrganizationWorkspaceMemberDto,
  OrganizationWorkspaceSeatsDto,
  OrganizationWorkspaceSnapshot,
} from './organizationWorkspaceTypes';

type RelayResponse = {
  relay?: string;
  error?: string;
  message?: string;
};

async function fetchWorkspaceSlice<T>(
  url: string,
  token: string,
  parse: (json: unknown) => T | null
): Promise<T | null> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const body = json as RelayResponse;
  if (body.relay === 'client_supabase_deprecated') return null;
  return parse(json);
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
    if (row.role !== 'owner' && row.role !== 'admin' && row.role !== 'member') return null;
    if (row.status !== 'active' && row.status !== 'invited' && row.status !== 'removed') return null;
    members.push({
      id: row.id,
      userId: row.userId,
      displayName: row.displayName,
      email: typeof row.email === 'string' ? row.email : null,
      role: row.role,
      status: row.status,
    });
  }
  return members;
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
      row.status !== 'expired'
    ) {
      return null;
    }
    if (typeof row.sentLabel !== 'string' || typeof row.createdAt !== 'string') return null;
    if (row.role !== 'owner' && row.role !== 'admin' && row.role !== 'member') return null;
    invites.push({
      id: row.id,
      email: row.email,
      status: row.status,
      role: row.role,
      invitedBy: typeof row.invitedBy === 'string' ? row.invitedBy : null,
      expiresAt: typeof row.expiresAt === 'string' ? row.expiresAt : null,
      createdAt: row.createdAt,
      sentLabel: row.sentLabel,
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
  return {
    organizationId: o.organizationId,
    seatsUsed: o.seatsUsed,
    seatLimit: o.seatLimit,
    seatsAvailable: o.seatsAvailable,
    source: o.source,
    notes: typeof o.notes === 'string' ? o.notes : null,
    planName: typeof o.planName === 'string' ? o.planName : null,
    appBreakdown: Array.isArray(o.appBreakdown)
      ? (o.appBreakdown as OrganizationWorkspaceSeatsDto['appBreakdown'])
      : [],
  };
}

function parseAppAccessJson(json: unknown): OrganizationWorkspaceAppAccessDto | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  if (typeof o.organizationId !== 'string') return null;
  if (!Array.isArray(o.entries) || !Array.isArray(o.orgApps)) return null;
  return {
    organizationId: o.organizationId,
    entries: o.entries as OrganizationWorkspaceAppAccessDto['entries'],
    orgApps: o.orgApps as OrganizationWorkspaceAppAccessDto['orgApps'],
  };
}

export type OrganizationWorkspaceApiUrls = {
  readonly members: string;
  readonly invites: string;
  readonly seats: string;
  readonly appAccess: string;
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
};

export function useZenformedOrganizationWorkspace({
  apiUrls,
  getAccessToken,
  enabled = true,
}: UseZenformedOrganizationWorkspaceOptions): UseZenformedOrganizationWorkspaceResult {
  const [snapshot, setSnapshot] = useState<OrganizationWorkspaceSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLiveData, setHasLiveData] = useState(false);

  const fetchAll = useCallback(async () => {
    const token = getAccessToken()?.trim();
    if (!token) {
      setLoadError('Not signed in');
      setHasLiveData(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const [members, invites, seats, appAccess] = await Promise.all([
        fetchWorkspaceSlice(apiUrls.members, token, parseMembersJson),
        fetchWorkspaceSlice(apiUrls.invites, token, parseInvitesJson),
        fetchWorkspaceSlice(apiUrls.seats, token, parseSeatsJson),
        fetchWorkspaceSlice(apiUrls.appAccess, token, parseAppAccessJson),
      ]);

      const anyOk = members != null || invites != null || seats != null || appAccess != null;
      if (!anyOk) {
        setLoadError('Organization workspace data is not available');
        setHasLiveData(false);
        setSnapshot(null);
        return;
      }

      setSnapshot({
        members: members ?? [],
        invites: invites ?? [],
        seats,
        appAccess,
      });
      setHasLiveData(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load organization data');
      setHasLiveData(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrls.appAccess, apiUrls.invites, apiUrls.members, apiUrls.seats, getAccessToken]);

  useEffect(() => {
    if (!enabled) return;
    void fetchAll();
  }, [enabled, fetchAll]);

  return {
    snapshot,
    isLoading,
    loadError,
    hasLiveData,
    refetch: fetchAll,
  };
}
