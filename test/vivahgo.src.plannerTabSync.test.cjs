const assert = require('node:assert/strict');

const { appPath, toFileUrl } = require('./helpers/testUtils.cjs');

async function load() {
  return import(`${toFileUrl(appPath('src/features/planner/lib/plannerTabSync.js'))}?t=${Date.now()}`);
}

function createFakeWindow({ withBroadcastChannel = true } = {}) {
  const listeners = new Map();
  const postedMessages = [];
  const storageWrites = [];

  class FakeBroadcastChannel {
    constructor(name) {
      this.name = name;
      this.onmessage = null;
      this.closed = false;
    }

    postMessage(message) {
      postedMessages.push({ name: this.name, message });
    }

    close() {
      this.closed = true;
    }
  }

  return {
    postedMessages,
    storageWrites,
    windowRef: {
      BroadcastChannel: withBroadcastChannel ? FakeBroadcastChannel : undefined,
      localStorage: {
        setItem(key, value) {
          storageWrites.push({ key, value });
        },
      },
      addEventListener(type, listener) {
        listeners.set(type, listener);
      },
      removeEventListener(type, listener) {
        if (listeners.get(type) === listener) {
          listeners.delete(type);
        }
      },
      dispatchStorage(key, newValue) {
        listeners.get('storage')?.({ key, newValue });
      },
    },
  };
}

describe('VivahGo planner tab sync', function () {
  it('builds and publishes well-shaped messages', async function () {
    const mod = await load();
    const fake = createFakeWindow();
    const planner = { activePlanId: 'plan_1', tasks: [{ id: 1, name: 'Book venue' }] };
    const message = mod.buildPlannerTabSyncMessage({
      tabId: 'tab_a',
      authMode: 'google',
      plannerOwnerId: 'owner_1',
      activePlanId: 'plan_1',
      plannerRevision: 3,
      planner,
      timestamp: 123,
    });

    assert.deepEqual(message, {
      type: 'planner-snapshot',
      tabId: 'tab_a',
      authMode: 'google',
      plannerOwnerId: 'owner_1',
      activePlanId: 'plan_1',
      plannerRevision: 3,
      timestamp: 123,
      planner,
    });

    mod.publishPlannerTabSyncMessage(message, { windowRef: fake.windowRef });

    assert.equal(fake.postedMessages.length, 1);
    assert.equal(fake.postedMessages[0].name, mod.PLANNER_TAB_SYNC_CHANNEL);
    assert.deepEqual(fake.postedMessages[0].message, message);
    assert.equal(fake.storageWrites.length, 0);
  });

  it('filters same-tab and mismatched-context messages', async function () {
    const mod = await load();
    const baseMessage = mod.buildPlannerTabSyncMessage({
      tabId: 'tab_a',
      authMode: 'google',
      plannerOwnerId: 'owner_1',
      planner: { activePlanId: 'plan_1' },
    });

    assert.equal(mod.shouldAcceptPlannerTabSyncMessage(baseMessage, {
      tabId: 'tab_a',
      authMode: 'google',
      plannerOwnerId: 'owner_1',
    }), false);

    assert.equal(mod.shouldAcceptPlannerTabSyncMessage(baseMessage, {
      tabId: 'tab_b',
      authMode: 'demo',
      plannerOwnerId: 'owner_1',
    }), false);

    assert.equal(mod.shouldAcceptPlannerTabSyncMessage(baseMessage, {
      tabId: 'tab_b',
      authMode: 'google',
      plannerOwnerId: 'owner_2',
    }), false);

    assert.equal(mod.shouldAcceptPlannerTabSyncMessage(baseMessage, {
      tabId: 'tab_b',
      authMode: 'google',
      plannerOwnerId: 'owner_1',
    }), true);
  });

  it('subscribes through the storage fallback when BroadcastChannel is unavailable', async function () {
    const mod = await load();
    const fake = createFakeWindow({ withBroadcastChannel: false });
    const received = [];
    const unsubscribe = mod.subscribeToPlannerTabSyncMessages(
      message => received.push(message),
      { windowRef: fake.windowRef }
    );
    const message = mod.buildPlannerTabSyncMessage({
      tabId: 'tab_a',
      authMode: 'google',
      plannerOwnerId: 'owner_1',
      planner: { activePlanId: 'plan_1' },
    });

    mod.publishPlannerTabSyncMessage(message, { windowRef: fake.windowRef });
    fake.windowRef.dispatchStorage(mod.PLANNER_TAB_SYNC_STORAGE_KEY, fake.storageWrites[0].value);

    assert.deepEqual(received, [message]);

    unsubscribe();
    fake.windowRef.dispatchStorage(mod.PLANNER_TAB_SYNC_STORAGE_KEY, fake.storageWrites[0].value);
    assert.equal(received.length, 1);
  });
});
