// Offline-first local data store using localStorage

const KEYS = {
  TESTER: 'hl_tester',
  CLIENTS: 'hl_clients',
  DEVICES: 'hl_devices',
  CAMP: 'hl_camp',
  SYNC_QUEUE: 'hl_sync_queue',
}

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

export function generateClientId() {
  const digits = Math.floor(1000 + Math.random() * 9000).toString()
  return digits + checkChar(digits)
}

function generateDeviceId() {
  const adj = ['SWIFT','CLEAR','BRIGHT','SHARP','KEEN','BOLD']
  const noun = ['EYE','LENS','BEAM','SIGHT','VIEW','IRIS']
  return adj[Math.floor(Math.random() * adj.length)] + '-' + noun[Math.floor(Math.random() * noun.length)] + '-' + Math.floor(10 + Math.random() * 90)
}

// --- Tester ---
export function getTester() { return load(KEYS.TESTER) }
export function saveTester(t) { save(KEYS.TESTER, { ...t, loginAt: Date.now() }) }
export function isLoggedIn() {
  const t = getTester()
  if (!t) return false
  return (Date.now() - t.loginAt) < 30 * 24 * 60 * 60 * 1000
}
export function logout() { localStorage.removeItem(KEYS.TESTER) }

// Quick demo login — pre-seeds a tester + data
export function demoLogin() {
  saveTester({ name: 'Sophia Kalpokas', role: 'Tester', experience: 'Experienced', ageBand: '25-34', gender: 'Female', homeBase: 'Port Vila, Vanuatu' })
  // Pre-seed demo clients if not already there
  if (!load(KEYS.CLIENTS)) save(KEYS.CLIENTS, DEMO_CLIENTS)
  if (!load(KEYS.CAMP)) save(KEYS.CAMP, DEMO_CAMP)
  if (!load(KEYS.DEVICES)) save(KEYS.DEVICES, DEMO_DEVICES)
}

// --- Camp ---
const DEMO_CAMP = {
  name: 'Luganville Eye Camp',
  location: 'Santo, Vanuatu',
  date: new Date().toISOString().slice(0, 10),
  campId: 'CAMP-2847',
  startTime: Date.now() - 4 * 3600000,
}

export function getCamp() {
  return load(KEYS.CAMP, DEMO_CAMP)
}
export function saveCamp(c) { save(KEYS.CAMP, c) }

// --- Devices ---
const DEMO_DEVICES = [
  { id: 'SWIFT-EYE-14', role: 'Tester',      tester: 'Ana Kalpokas',   status: 'online',  lastSeen: Date.now() - 12000,      clients: 8,  battery: 87 },
  { id: 'KEEN-LENS-33',  role: 'Tester',      tester: 'James Tavita',   status: 'online',  lastSeen: Date.now() - 3000,       clients: 12, battery: 62 },
  { id: 'BOLD-IRIS-71',  role: 'Supervisor',  tester: 'Dr. Sarah Lini', status: 'syncing', lastSeen: Date.now() - 45000,      clients: 0,  battery: 94 },
  { id: 'CLEAR-BEAM-55', role: 'Tester',      tester: 'Mere Tuilagi',   status: 'offline', lastSeen: Date.now() - 8 * 60000,  clients: 5,  battery: 31 },
]

export function getDevices() {
  const saved = load(KEYS.DEVICES)
  if (saved && saved.length > 0) return saved
  save(KEYS.DEVICES, DEMO_DEVICES)
  return DEMO_DEVICES
}

export function getThisDevice() {
  let d = load('hl_this_device')
  if (!d) {
    d = { id: 'SHARP-VIEW-29', role: 'Tester', battery: 78 }
    save('hl_this_device', d)
  }
  return d
}

// --- Demo clients ---
const now = Date.now()
const DEMO_CLIENTS = [
  {
    id: '7243K', ageBand: '50-59', gender: 'F', location: 'Luganville', cataractHx: false,
    status: 'dispensed', steps: ['distance','wheel','near','lens'], createdAt: now - 3600000, synced: true,
    clinical: { distanceVA_R: '6/18', distanceVA_L: '6/12', wheelResult: 'Mild astigmatism OD', nearVA_R: 'N8', nearVA_L: 'N8',
      dispensed: { sph_R: '-1.00', cyl_R: '-0.50', axis_R: '90', sph_L: '-0.75', cyl_L: '0.00', axis_L: '0', add: '+1.50', frame: 'F04-TRT' } }
  },
  {
    id: '3381M', ageBand: '60-69', gender: 'M', location: 'Luganville', cataractHx: true,
    status: 'in-progress', steps: ['distance','wheel'], createdAt: now - 900000, synced: false,
    clinical: { distanceVA_R: '6/60', distanceVA_L: '6/36', wheelResult: 'Significant astigmatism OU' }
  },
  {
    id: '5592A', ageBand: '40-49', gender: 'F', location: 'Luganville', cataractHx: false,
    status: 'dispensed', steps: ['distance','wheel','near','lens'], createdAt: now - 7200000, synced: true,
    clinical: { distanceVA_R: '6/6', distanceVA_L: '6/9', wheelResult: 'No significant astigmatism', nearVA_R: 'N6', nearVA_L: 'N6',
      dispensed: { sph_R: '0.00', cyl_R: '0.00', axis_R: '0', sph_L: '+0.50', cyl_L: '0.00', axis_L: '0', add: '+1.00', frame: 'F02-BRN' } }
  },
  {
    id: '9914C', ageBand: '70+', gender: 'M', location: 'Big Bay', cataractHx: true,
    status: 'waiting', steps: [], createdAt: now - 300000, synced: false, clinical: {}
  },
  {
    id: '1127R', ageBand: '30-39', gender: 'F', location: 'Luganville', cataractHx: false,
    status: 'dispensed', steps: ['distance','wheel','near','lens'], createdAt: now - 5400000, synced: true,
    clinical: { distanceVA_R: '6/9', distanceVA_L: '6/6', wheelResult: 'No significant astigmatism', nearVA_R: 'N5', nearVA_L: 'N5',
      dispensed: { sph_R: '-0.50', cyl_R: '0.00', axis_R: '0', sph_L: '0.00', cyl_L: '0.00', axis_L: '0', add: '+0.75', frame: 'F01-BLK' } }
  },
  {
    id: '8803F', ageBand: '50-59', gender: 'M', location: 'Luganville', cataractHx: false,
    status: 'in-progress', steps: ['distance'], createdAt: now - 420000, synced: false,
    clinical: { distanceVA_R: '6/24', distanceVA_L: '6/18' }
  },
  {
    id: '4456P', ageBand: '40-49', gender: 'F', location: 'Norsup', cataractHx: false,
    status: 'waiting', steps: [], createdAt: now - 120000, synced: false, clinical: {}
  },
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

// --- Sync queue ---
export function addToSyncQueue(item) {
  const q = load(KEYS.SYNC_QUEUE, [])
  q.push({ ...item, queuedAt: Date.now() })
  save(KEYS.SYNC_QUEUE, q)
}
export function getSyncQueue() { return load(KEYS.SYNC_QUEUE, []) }
export function clearSyncQueue() { save(KEYS.SYNC_QUEUE, []) }

// --- QR payload ---
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
    v: 1, campId: camp.campId, tester: tester?.name, ts: Date.now(),
    clients: clients.map(c => ({ id: c.id, status: c.status, steps: c.steps, clinical: c.clinical, updatedAt: c.createdAt })),
  }
}
