// HoneyLens — OOXii Field Platform — Offline-first data store

const KEYS = {
  TESTER:     'hl_tester',
  CLIENTS:    'hl_clients',
  DEVICES:    'hl_devices',
  CAMP:       'hl_camp',
  SYNC_QUEUE: 'hl_sync_queue',
  REMEMBER:   'hl_remember',
  REGION_SET: 'hl_region_set',
}

function load(key, fallback = null) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

// --- Password validation ---
export function validatePassword(pw) {
  const errors = []
  if (pw.length < 8)              errors.push('At least 8 characters')
  if (!/[A-Z]/.test(pw))         errors.push('At least 1 uppercase letter (A-Z)')
  if (!/[!@#$%^&*()_+\-=[\]{}|;':",.<>?/`~\\]/.test(pw)) errors.push('At least 1 special character (e.g., !@#$)')
  return errors
}

// --- Auth ---
export function getTester()  { return load(KEYS.TESTER) }
export function isLoggedIn() {
  const t = getTester()
  if (!t) return false
  const remember = load(KEYS.REMEMBER, false)
  const maxAge = remember ? 30 * 24 * 3600000 : 8 * 3600000
  return (Date.now() - t.loginAt) < maxAge
}
export function logout() { localStorage.removeItem(KEYS.TESTER) }
export function hasSetRegion() { return !!load(KEYS.REGION_SET) }
export function setRegionConfirmed() { save(KEYS.REGION_SET, true) }

export function register(data) {
  save(KEYS.TESTER, { ...data, loginAt: Date.now(), id: 'T-' + Math.floor(10000 + Math.random() * 90000) })
}

export function login(email, password, remember) {
  // Demo: any credentials work; in production this hits the API
  const existing = getTester()
  if (existing && existing.email === email) {
    save(KEYS.TESTER, { ...existing, loginAt: Date.now() })
    save(KEYS.REMEMBER, remember)
    return true
  }
  // Demo fallback — create a session
  save(KEYS.TESTER, {
    email, firstName: 'John', lastName: 'Smith', gender: 'Male',
    country: 'Australia', state: 'New South Wales', city: 'Sydney',
    role: 'Optometrist', experience: 'Experienced', organisation: 'OOXii',
    loginAt: Date.now(), id: 'T-00001',
  })
  save(KEYS.REMEMBER, remember)
  return true
}

export function demoLogin() {
  save(KEYS.TESTER, {
    email: 'sophia@ooxii.org', firstName: 'Sophia', lastName: 'Kalpokas',
    gender: 'Female', country: 'Vanuatu', state: 'Sanma', city: 'Luganville',
    role: 'Tester', experience: 'Experienced', organisation: 'OOXii Vanuatu',
    loginAt: Date.now(), id: 'T-00042',
  })
  save(KEYS.REMEMBER, true)
  save(KEYS.REGION_SET, true)
  if (!load(KEYS.CLIENTS)) save(KEYS.CLIENTS, DEMO_CLIENTS)
  if (!load(KEYS.CAMP))    save(KEYS.CAMP, DEMO_CAMP)
  if (!load(KEYS.DEVICES)) save(KEYS.DEVICES, DEMO_DEVICES)
}

// --- Forgot password ---
export function sendPasswordReset(email) {
  // Demo: simulate sending
  return new Promise(res => setTimeout(() => res(true), 1200))
}

// --- Camp ---
const DEMO_CAMP = {
  name: 'Luganville Eye Camp', location: 'Santo, Vanuatu',
  date: new Date().toISOString().slice(0, 10),
  campId: 'CAMP-2847', startTime: Date.now() - 4 * 3600000,
}
export function getCamp()   { return load(KEYS.CAMP, DEMO_CAMP) }
export function saveCamp(c) { save(KEYS.CAMP, c) }

// --- Devices ---
const DEMO_DEVICES = [
  { id: 'SWIFT-EYE-14', role: 'Tester',     tester: 'Ana Kalpokas',   status: 'online',  lastSeen: Date.now() - 12000,     clients: 8,  battery: 87 },
  { id: 'KEEN-LENS-33',  role: 'Tester',     tester: 'James Tavita',   status: 'online',  lastSeen: Date.now() - 3000,      clients: 12, battery: 62 },
  { id: 'BOLD-IRIS-71',  role: 'Supervisor', tester: 'Dr. Sarah Lini', status: 'syncing', lastSeen: Date.now() - 45000,     clients: 0,  battery: 94 },
  { id: 'CLEAR-BEAM-55', role: 'Tester',     tester: 'Mere Tuilagi',   status: 'offline', lastSeen: Date.now() - 8 * 60000, clients: 5,  battery: 31 },
]
export function getDevices()   { const s = load(KEYS.DEVICES); if (s?.length) return s; save(KEYS.DEVICES, DEMO_DEVICES); return DEMO_DEVICES }
export function getThisDevice() {
  let d = load('hl_this_device')
  if (!d) { d = { id: 'SHARP-VIEW-29', role: 'Tester', battery: 78 }; save('hl_this_device', d) }
  return d
}

// --- OOXii line → Snellen lookup ---
export const OOXII_LINES = [
  { line: 1,  snellen: '6/60'  }, { line: 2,  snellen: '6/48'  },
  { line: 3,  snellen: '6/36'  }, { line: 4,  snellen: '6/30'  },
  { line: 5,  snellen: '6/24'  }, { line: 6,  snellen: '6/18'  },
  { line: 7,  snellen: '6/15'  }, { line: 8,  snellen: '6/12'  },
  { line: 9,  snellen: '6/9'   }, { line: 10, snellen: '6/7.5' },
  { line: 11, snellen: '6/6'   }, { line: 12, snellen: '6/5'   },
  { line: 13, snellen: '6/4'   }, { line: 14, snellen: '6/3'   },
]

export function calcSnellen(lineNum, partialLetters) {
  if (!lineNum) return '—'
  const idx = OOXII_LINES.findIndex(l => l.line === parseInt(lineNum))
  if (idx < 0) return '—'
  if (!partialLetters || partialLetters === '0') return OOXII_LINES[idx].snellen
  // Partial credit: show as e.g. 6/12 (partial)
  const nextLine = OOXII_LINES[idx + 1]
  return nextLine ? `${OOXII_LINES[idx].snellen}+${partialLetters}` : OOXII_LINES[idx].snellen
}

// --- Clients ---
const now = Date.now()
const DEMO_CLIENTS = [
  { id: 'OX-7243', yearOfBirth: 1974, gender: 'F', location: 'Luganville', cataract: 'none',
    status: 'dispensed', createdAt: now - 3600000, synced: true,
    clinical: { distVA_R_line: '8', distVA_R_partial: '2', distVA_R: '6/12+2', distVA_L_line: '9', distVA_L_partial: '0', distVA_L: '6/9', ownGlasses: 'yes', distVA_both_line: '10', distVA_both: '6/7.5', nearVA_line: '8', nearVA: '6/12', readingGlasses: 'no', pd: '64', wheelR: { best: 'minus', lens: '-1.00', colour: 'same', readLine9: 'yes' } }
  },
  { id: 'OX-3381', yearOfBirth: 1963, gender: 'M', location: 'Luganville', cataract: 'both',
    status: 'in-progress', createdAt: now - 900000, synced: false,
    clinical: { distVA_R_line: '4', distVA_R_partial: '1', distVA_R: '6/30+1', distVA_L_line: '5', distVA_L_partial: '0', distVA_L: '6/24' }
  },
  { id: 'OX-5592', yearOfBirth: 1982, gender: 'F', location: 'Luganville', cataract: 'none',
    status: 'dispensed', createdAt: now - 7200000, synced: true,
    clinical: { distVA_R_line: '11', distVA_R_partial: '0', distVA_R: '6/6', distVA_L_line: '10', distVA_L_partial: '2', distVA_L: '6/7.5+2' }
  },
  { id: 'OX-9914', yearOfBirth: 1951, gender: 'M', location: 'Big Bay', cataract: 'right',
    status: 'waiting', createdAt: now - 300000, synced: false, clinical: {}
  },
  { id: 'OX-1127', yearOfBirth: 1989, gender: 'F', location: 'Luganville', cataract: 'none',
    status: 'dispensed', createdAt: now - 5400000, synced: true,
    clinical: { distVA_R_line: '10', distVA_R: '6/7.5', distVA_L_line: '11', distVA_L: '6/6' }
  },
]

export function getClients()  { const s = load(KEYS.CLIENTS); if (s?.length) return s; save(KEYS.CLIENTS, DEMO_CLIENTS); return DEMO_CLIENTS }
export function getClient(id) { return getClients().find(c => c.id === id) }

export function saveClient(client) {
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === client.id)
  if (idx >= 0) clients[idx] = client; else clients.unshift(client)
  save(KEYS.CLIENTS, clients)
  addToSyncQueue({ type: 'client', id: client.id })
}

export function createClient(data) {
  const id = 'OX-' + Math.floor(1000 + Math.random() * 9000)
  const client = { id, ...data, status: 'in-progress', createdAt: Date.now(), synced: false, clinical: {} }
  saveClient(client)
  return client
}

// --- Sync ---
export function addToSyncQueue(item) {
  const q = load(KEYS.SYNC_QUEUE, []); q.push({ ...item, queuedAt: Date.now() }); save(KEYS.SYNC_QUEUE, q)
}
export function getSyncQueue()   { return load(KEYS.SYNC_QUEUE, []) }
export function clearSyncQueue() { save(KEYS.SYNC_QUEUE, []) }

// --- QR ---
export function encodeQRPayload(data)  { return btoa(JSON.stringify(data)).replace(/=/g, '') }
export function decodeQRPayload(str)   { try { return JSON.parse(atob(str + '==')) } catch { return null } }
export function buildSyncPayload(clients) {
  const camp = getCamp(); const tester = getTester()
  return { v: 1, campId: camp.campId, tester: tester?.firstName, ts: Date.now(),
    clients: clients.map(c => ({ id: c.id, status: c.status, clinical: c.clinical })) }
}

// --- Location data ---
export const COUNTRIES = ['Australia','Vanuatu','Papua New Guinea','Solomon Islands','Fiji','Samoa','Tonga','New Zealand','Timor-Leste','Indonesia','Philippines']
export const STATES = {
  'Australia': ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania','ACT','Northern Territory'],
  'Vanuatu': ['Shefa','Sanma','Tafea','Malampa','Penama','Torba'],
  'Papua New Guinea': ['National Capital District','Morobe','Eastern Highlands','Western Highlands','Central','Gulf','Milne Bay'],
  'Solomon Islands': ['Guadalcanal','Malaita','Western','Central'],
  'Fiji': ['Central','Western','Northern','Eastern'],
  'Samoa': ['Apia Urban Area','Rest of Samoa'],
  'Tonga': ["Tongatapu","Ha'apai","Vava'u"],
  'New Zealand': ['Auckland','Wellington','Canterbury','Waikato','Bay of Plenty','Otago','Manawatu-Whanganui'],
  'default': ['Region 1','Region 2','Region 3'],
}
export const CITIES = {
  'New South Wales': ['Sydney','Newcastle','Wollongong','Canberra','Dubbo','Tamworth','Albury'],
  'Victoria': ['Melbourne','Geelong','Ballarat','Bendigo'],
  'Queensland': ['Brisbane','Gold Coast','Cairns','Townsville'],
  'Sanma': ['Luganville','Big Bay','Norsup'],
  'Shefa': ['Port Vila','Mele','Pango'],
  'National Capital District': ['Port Moresby'],
  'Guadalcanal': ['Honiara'],
  'Central': ['Suva'],
  'Tongatapu': ["Nuku'alofa"],
  'Auckland': ['Auckland City','North Shore','Waitakere','Manukau'],
  'default': ['City 1','City 2','City 3'],
}
export const HEALTH_ROLES = ['Optometrist','Ophthalmologist','Nurse','Community Health Worker','Tester','Volunteer','Other']
export const EXPERIENCE_LEVELS = ['First time','Trained (1-5 sessions)','Experienced (6-20 sessions)','Expert (20+ sessions)']
