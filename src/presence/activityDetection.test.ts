import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPresenceActivityController } from './activityDetection';

describe('createPresenceActivityController', () => {
  it('starts online and becomes away after idle, then online on activity', async () => {
    const states: string[] = [];
    const listeners = new Map<string, Set<EventListener>>();

    const doc = {
      visibilityState: 'visible' as DocumentVisibilityState,
      addEventListener(type: string, listener: EventListener) {
        const set = listeners.get(type) ?? new Set();
        set.add(listener);
        listeners.set(type, set);
      },
      removeEventListener(type: string, listener: EventListener) {
        listeners.get(type)?.delete(listener);
      },
    };

    const win = {
      addEventListener(type: string, listener: EventListener) {
        const set = listeners.get(`win:${type}`) ?? new Set();
        set.add(listener);
        listeners.set(`win:${type}`, set);
      },
      removeEventListener(type: string, listener: EventListener) {
        listeners.get(`win:${type}`)?.delete(listener);
      },
    };

    const controller = createPresenceActivityController({
      awayAfterMs: 30,
      throttleMs: 5,
      target: doc as unknown as Document,
      win: win as unknown as Window,
      onAutomaticStateChange: (state) => {
        states.push(state);
      },
    });

    assert.equal(controller.getAutomaticState(), 'online');

    await new Promise((resolve) => setTimeout(resolve, 45));
    assert.equal(controller.getAutomaticState(), 'away');
    assert.ok(states.includes('away'));

    const pointerHandlers = listeners.get('pointerdown');
    assert.ok(pointerHandlers && pointerHandlers.size > 0);
    for (const handler of pointerHandlers!) {
      handler(new Event('pointerdown'));
    }

    assert.equal(controller.getAutomaticState(), 'online');
    assert.ok(states.includes('online'));

    controller.dispose();
  });
});
