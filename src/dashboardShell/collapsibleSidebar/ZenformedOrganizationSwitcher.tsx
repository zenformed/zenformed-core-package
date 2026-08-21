'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import styles from './collapsibleSidebar.module.css';
import { shouldEnableOrganizationSwitching } from './types';

export type ZenformedOrganizationOption = {
  readonly id: string;
  readonly name: string;
  readonly role: 'owner' | 'admin' | 'coordinator' | 'member';
};

export type ZenformedOrganizationSwitcherState = {
  readonly organizations: readonly ZenformedOrganizationOption[];
  readonly currentOrganizationId: string | null;
  readonly loading: boolean;
  readonly switching: boolean;
  readonly error: string | null;
  readonly switchOrganization: (organizationId: string) => Promise<void>;
};

export function parseZenformedOrganizationContext(value: unknown): {
  currentOrganizationId: string;
  organizations: ZenformedOrganizationOption[];
} | null {
  if (value == null || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.currentOrganizationId !== 'string' || !Array.isArray(raw.organizations)) return null;
  const organizations = raw.organizations
    .map((entry): ZenformedOrganizationOption | null => {
      if (entry == null || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;
      if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
      if (!['owner', 'admin', 'coordinator', 'member'].includes(String(row.role))) return null;
      return {
        id: row.id,
        name: row.name,
        role: row.role as ZenformedOrganizationOption['role'],
      };
    })
    .filter((entry): entry is ZenformedOrganizationOption => entry != null);
  return organizations.some((entry) => entry.id === raw.currentOrganizationId)
    ? { currentOrganizationId: raw.currentOrganizationId, organizations }
    : null;
}

export function useZenformedOrganizationSwitcher(input: {
  readonly apiUrl: string;
  readonly getAccessToken: () => string | null | Promise<string | null>;
  readonly enabled?: boolean;
  readonly onSwitched: (organization: ZenformedOrganizationOption) => void | Promise<void>;
}): ZenformedOrganizationSwitcherState {
  const [organizations, setOrganizations] = useState<ZenformedOrganizationOption[]>([]);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(input.enabled !== false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (input.enabled === false) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      setError(null);
      const token = await input.getAccessToken();
      if (!token) throw new Error('Session is not ready.');
      const response = await fetch(input.apiUrl, {
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const context = parseZenformedOrganizationContext(await response.json().catch(() => null));
      if (!response.ok || context == null) throw new Error('Organizations could not be loaded.');
      if (!controller.signal.aborted) {
        setOrganizations(context.organizations);
        setCurrentOrganizationId(context.currentOrganizationId);
      }
    })().catch((cause: unknown) => {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Organizations could not be loaded.');
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [input.apiUrl, input.enabled, input.getAccessToken]);

  const switchOrganization = useCallback(async (organizationId: string) => {
    const selected = organizations.find((organization) => organization.id === organizationId);
    if (selected == null || selected.id === currentOrganizationId || switching) return;
    setSwitching(true);
    setError(null);
    try {
      const token = await input.getAccessToken();
      if (!token) throw new Error('Session is not ready.');
      const response = await fetch(input.apiUrl, {
        method: 'PATCH',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId: selected.id }),
      });
      if (!response.ok) throw new Error('Organization could not be changed.');
      setCurrentOrganizationId(selected.id);
      await input.onSwitched(selected);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Organization could not be changed.');
      throw cause;
    } finally {
      setSwitching(false);
    }
  }, [currentOrganizationId, input, organizations, switching]);

  return { organizations, currentOrganizationId, loading, switching, error, switchOrganization };
}

export function ZenformedOrganizationSwitcher(props: {
  readonly organizationName: string;
  readonly state?: ZenformedOrganizationSwitcherState | null;
  readonly mobile?: boolean;
}): ReactElement {
  const name = props.organizationName.trim() || 'Organization';
  const interactive = shouldEnableOrganizationSwitching(props.state?.organizations.length ?? 0);
  const className = props.mobile ? styles.mobileOrgName : styles.orgName;
  if (!interactive) return <p className={className} title={name}>{name}</p>;
  return (
    <div className={`${className} ${styles.orgSwitcherWrap}`}>
      <select
        className={styles.orgSwitcherSelect}
        aria-label="Switch organization"
        value={props.state?.currentOrganizationId ?? ''}
        disabled={props.state?.switching}
        onChange={(event) => void props.state?.switchOrganization(event.target.value).catch(() => undefined)}
      >
        {props.state?.organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>{organization.name}</option>
        ))}
      </select>
      {props.state?.error ? <span className={styles.orgSwitcherError} role="alert">{props.state.error}</span> : null}
    </div>
  );
}
