// Offline-first local data store using localStorage

const KEYS = {
  TESTER: 'hl_tester',
  CLIENTS: 'hl_clients',
  SESSIONS: 'hl_sessions',
  DEVICES: 'hl_devices',
  CAMP: 'hl_camp',
  SYNC_QUEUE: 'hl_sync_queue',
}

// --- Helpers ---
function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Check character for short IDs ---
function checkChar(id) {
  const CHARS = 'ACDEFHJKLMNPRTUVWXY3479'
  let n = 0
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % CHARS.length
  return CHARS[n]
}

function generateClientId() {
  const digits = Math.floor(1000 + Math.random() * 9000).toString()
  return digits + checkChar(digits)
}

function generateDeviceId() {
  const adj = ['SWIFT', 'CLEAR', 'BRIGHT', 'SHARP', 'KEEN']
  const noun = ['EYE', 'LENS', 'BEAM', 'SIGHT', 'VIEW']
  return adj[Math.floor(Math.random() * adj.length)] + '-' + noun[Math.floor(Math.random() * noun.length)] + '-' + Math.floor(10 + Math.random() * 90)
}

// --- Tester ---
export function getTester() { return load(KEYS.TESTER) }
export function saveTester(t) { save(KEYS.TESTER, { ...t, loginAt: Date.now() }) }
export function isLoggedIn() {
  const t = getTester()
  if (!t) return false
  const days30 = 30 * 24 * 60 * 60 * 1000
  return (Date.now() - t.loginAt) < days30
}
export function logout() { localStorage.removeItem(KEYS.TESTER) }

// --- Camp ---
export function getCamp() {
  return load(KEYS.CAMP, {
    name: 'Luganville Eye Camp',
    location: 'Santo, Vanuatu',
    date: new Date().toISOString().slice(0, 10),
    campId: 'CAMP-' + Math.floor(1000 + Math.random() * 9000),
  })
}
export function saveCamp(c) { save(KEYS.CAMP, c) }

// --- Devices ---
const DEMO_DEVICES = [
  { id: generateDeviceId(), role: 'Tester', tester: 'Ana Kalpokas', status: 'online', lastSeen: Date.now() - 12000, clients: 8, battery: 87 },
  { id: generateDeviceId(), role: 'Tester', tester: 'James Tavita', status: 'online', lastSeen: Date.now() - 3000, clients: 12, battery: 62 },
  { id: generateDeviceId(), role: 'Supervisor', tester: 'Dr. Sarah Lini', status: 'syncing', lastSeen: Date.now() - 45000, clients: 0, battery: 94 },
  { id: generateDeviceId(), role: 'Tester', tester: 'Mere Tuilagi', status: 'offline', lastSeen: Date.now() - 8 * 60000, clients: 5, battery: 31 },
]

export function getDevices() {
  const saved = load(KEYS.DEVICES)
  if (saved && saved.length > 0) return saved
  save(KEYS.DEVICES, DEMO_DEVICES)
  return DEMO_DEVICES
}

export function addDevice(d) {
  const devices = getDevices()
  const exists = devices.find(x => x.id === d.id)
  if (!exists) { devices.push(d); save(KEYS.DEVICES, devices) }
}

export function getThisDevice() {
  let d = load('hl_this_device')
  if (!d) {
    d = { id: generateDeviceId(), role: 'Tester', battery: 78 }
    save('hl_this_device', d)
  }
  return d
}

// --- Clients ---
const DEMO_CLIENTS = [
  { id: '7243K', ageBand: '50-59', gender: 'F', location: 'Luganville', cataractHx: false, status: 'dispensed', steps: ['distance', 'wheel', 'near', 'lens'], createdAt: Date.now() - 3600000, synced: true,
    clinical: { distanceVA_R: '6/18', distanceVA_L: '6/12', wheelResult: 'Mild astigmatism OD', nearVA_R: 'N8', nearVA_L: 'N8', dispensed: { sph_R: '-1.00', cyl_R: '-0.50', axis_R: '90', sph_L: '-0.75', cyl_L: '0.00', axis_L: '0', add: '+1.50', frame: 'F04-BLK' } }
  },
  { id: '3381M', ageBand: '60-69', gender: 'M', location: 'Luganville', cataractHx: true, status: 'in-progress', steps: ['distance', 'wheel'], createdAt: Date.now() - 900000, synced: false,
    clinical: { distanceVA_R: '6/60', distanceVA_L: '6/36', wheelResult: 'Significant astigmatism OU' }
  },
  { id: '5592A', ageBand: '40-49', gender: 'F', location: 'Luganville', cataractHx: false, status: 'dispensed', steps: ['distance', 'lens'], createdAt: Date.now() - 7200000, synced: true,
    clinical: { distanceVA_R: '6/6', distanceVA_L: '6/9', dispensed: { sph_R: '0.00', cyl_R: '0.00', axis_R: '0', sph_L: '+0.50', cyl_L: '0.00', axis_L: '0', add: '+1.00', frame: 'F02-BRN' } }
  },
  { id: '9914C', ageBand: '70+', gender: 'M', location: 'Luganville', cataractHx: true, status: 'waiting', steps: [], createdAt: Date.now() - 300000, synced: false, clinical: {} },
]

export function getClients() {
  const saved = load(KEYS.CLIENTS)
  if (saved && saved.length > 0) return saved
  save(KEYS.CLIENTS, DEMO_CLIENTS)
  return DEMO_CLIENTS
}

export function getClient(id) { return getClients().find(c => c.id === id) }

export function saveClient(client) {
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === client.id)
  if (idx >= 0) clients[idx] = client
  else clients.unshift(client)
  save(KEYS.CLIENTS, clients)
  addToSyncQueue({ type: 'client', id: client.id })
}

export function createClient(data) {
  const client = {
    id: generateClientId(),
    ageBand: data.ageBand || '',
    gender: data.gender || '',
    location: data.location || '',
    cataractHx: data.cataractHx || false,
    status: 'waiting',
    steps: [],
    createdAt: Date.now(),
    synced: false,
    clinical: {},
  }
  saveClient(client)
  return client
}

// --- Sessions ---
export function getSessions() { return load(KEYS.SESSIONS, []) }

// --- Sync queue ---
export function addToSyncQueue(item) {
  const q = load(KEYS.SYNC_QUEUE, [])
  q.push({ ...item, queuedAt: Date.now() })
  save(KEYS.SYNC_QUEUE, q)
}
export function getSyncQueue() { return load(KEYS.SYNC_QUEUE, []) }
export function clearSyncQueue() { save(KEYS.SYNC_QUEUE, []) }

// --- QR payload encode/decode ---
export function encodeQRPayload(data) {
  return btoa(JSON.stringify(data)).replace(/=/g, '')
}

export function decodeQRPayload(str) {
  try { return JSON.parse(atob(str + '==')) } catch { return null }
}

export function buildSyncPayload(clients) {
  const camp = getCamp()
  const tester = getTester()
  return {
    v: 1,
    campId: camp.campId,
    tester: tester?.name,
    ts: Date.now(),
    clients: clients.map(c => ({ id: c.id, status: c.status, steps: c.steps, clinical: c.clinical, updatedAt: c.createdAt })),
  }
}
