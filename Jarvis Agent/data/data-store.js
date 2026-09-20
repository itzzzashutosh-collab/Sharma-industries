const fs = require('fs');
const path = require('path');

class DataStore {
  constructor() {
    this.usersPath = path.join(__dirname, 'users.csv');
    this.productsPath = path.join(__dirname, 'products.csv');
    this.usersByPhone = new Map(); // cleanPhone -> user object
    this.products = [];
    this.init();
  }

  cleanPhone(phone) {
    if (!phone) return '';
    return String(phone).replace(/[^0-9]/g, '');
  }

  parseCsv(content) {
    if (!content) return [];
    const lines = content.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ''; });
      return row;
    });
  }

  loadUsers() {
    try {
      if (!fs.existsSync(this.usersPath)) return;
      const content = fs.readFileSync(this.usersPath, 'utf-8');
      const rows = this.parseCsv(content);
      const newMap = new Map();

      rows.forEach(user => {
        const clean = this.cleanPhone(user.phone);
        if (clean) {
          newMap.set(clean, user);
          if (clean.startsWith('91') && clean.length > 10) {
            newMap.set(clean.slice(2), user);
          }
        }
        // Extract and index LID alias if present in notes (e.g. LID: 260872136093846)
        const lidMatch = (user.notes || '').match(/LID:\s*(\d+)/i);
        if (lidMatch) {
          newMap.set(lidMatch[1], user);
        }
      });

      this.usersByPhone = newMap;
      console.log(`[DataStore] Loaded ${rows.length} users into unified memory store.`);
    } catch (err) {
      console.error('[DataStore] Error loading users.csv:', err.message);
    }
  }

  loadProducts() {
    try {
      if (!fs.existsSync(this.productsPath)) {
        this.products = [];
        return;
      }
      const content = fs.readFileSync(this.productsPath, 'utf-8');
      this.products = this.parseCsv(content);
      console.log(`[DataStore] Loaded ${this.products.length} products into unified catalog store.`);
    } catch (err) {
      console.error('[DataStore] Error loading products.csv:', err.message);
    }
  }

  init() {
    this.loadUsers();
    this.loadProducts();

    try {
      let uTimer;
      if (fs.existsSync(this.usersPath)) {
        const w = fs.watch(this.usersPath, () => {
          clearTimeout(uTimer);
          uTimer = setTimeout(() => {
            console.log('[DataStore] users.csv modified, reloading memory...');
            this.loadUsers();
          }, 300);
        });
        if (w.unref) w.unref();
      }

      let pTimer;
      if (fs.existsSync(this.productsPath)) {
        const wp = fs.watch(this.productsPath, () => {
          clearTimeout(pTimer);
          pTimer = setTimeout(() => {
            console.log('[DataStore] products.csv modified, reloading memory...');
            this.loadProducts();
          }, 300);
        });
        if (wp.unref) wp.unref();
      }
    } catch (e) {
      console.warn('[DataStore] File watch could not be attached:', e.message);
    }
  }

  getProducts() {
    return this.products || [];
  }

  getProduct(query) {
    if (!query || !this.products) return null;
    const q = String(query).toLowerCase().trim();
    return this.products.find(p => {
      const name = (p.product_name || '').toLowerCase();
      const sku = (p.sku_code || '').toLowerCase();
      return name.includes(q) || q.includes(name) || sku === q ||
        (q.includes('rustic') && name.includes('rustic')) ||
        (q.includes('texture') && name.includes('texture'));
    }) || null;
  }

  async saveProduct(prod) {
    if (!prod || !prod.product_name) return false;
    const existingIdx = this.products.findIndex(p =>
      (p.sku_code && prod.sku_code && p.sku_code === prod.sku_code) ||
      p.product_name.toLowerCase() === prod.product_name.toLowerCase()
    );

    if (existingIdx >= 0) {
      this.products[existingIdx] = { ...this.products[existingIdx], ...prod };
    } else {
      this.products.push(prod);
    }

    try {
      const headers = ['sku_code', 'product_name', 'category', 'pack_size', 'stock_qty', 'base_cost', 'dealer_net_tier1', 'dealer_net_tier2', 'homeowner_price', 'mrp', 'active_scheme', 'pricing_rules'];
      const lines = [headers.join(',')];
      this.products.forEach(p => {
        lines.push(headers.map(h => {
          const val = String(p[h] || '');
          return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(','));
      });
      await fs.promises.writeFile(this.productsPath, lines.join('\n') + '\n', 'utf-8');
      return true;
    } catch (err) {
      console.error('[DataStore] Failed to write products.csv:', err.message);
      return false;
    }
  }

  getUser(phone) {
    if (!phone) return null;
    const clean = this.cleanPhone(phone);
    if (this.usersByPhone.has(clean)) return this.usersByPhone.get(clean);
    if (clean.length > 10 && clean.startsWith('91')) {
      return this.usersByPhone.get(clean.slice(2)) || null;
    }
    return null;
  }

  getAllUsers() {
    // Return unique users
    const unique = new Map();
    for (const [_, u] of this.usersByPhone) {
      const key = this.cleanPhone(u.phone);
      if (!unique.has(key)) unique.set(key, u);
    }
    return Array.from(unique.values());
  }

  async saveUser(user) {
    if (!user || !user.phone) return false;
    const clean = this.cleanPhone(user.phone);

    // Standardize object
    const standardized = {
      phone: user.phone.startsWith('+') ? user.phone : '+' + clean,
      name: user.name || 'Valued Contact',
      role: user.role || 'lead',
      tier: user.tier || 'Tier 3',
      region: user.region || 'India',
      creditLimit: String(user.creditLimit || '0'),
      balanceDue: String(user.balanceDue || '0'),
      notes: (user.notes || '').replace(/,/g, ';')
    };

    // Update memory
    this.usersByPhone.set(clean, standardized);
    if (clean.startsWith('91') && clean.length > 10) {
      this.usersByPhone.set(clean.slice(2), standardized);
    }

    // Persist to CSV
    try {
      const all = this.getAllUsers();
      const headers = ['phone', 'name', 'role', 'tier', 'region', 'creditLimit', 'balanceDue', 'notes'];
      const lines = [headers.join(',')];
      all.forEach(u => {
        lines.push(headers.map(h => u[h] || '').join(','));
      });
      await fs.promises.writeFile(this.usersPath, lines.join('\n') + '\n', 'utf-8');
      return true;
    } catch (err) {
      console.error('[DataStore] Failed to write users.csv:', err.message);
      return false;
    }
  }

  async bindLidToUser(phoneOrClean, lidDigits) {
    if (!phoneOrClean || !lidDigits) return false;
    const clean = this.cleanPhone(phoneOrClean);
    const cleanLid = this.cleanPhone(lidDigits);
    const user = this.getUser(clean);
    if (!user) return false;

    // Check if LID is already registered in notes
    if (!user.notes || !user.notes.includes(cleanLid)) {
      user.notes = user.notes ? `${user.notes}; LID: ${cleanLid}` : `LID: ${cleanLid}`;
      this.usersByPhone.set(cleanLid, user);
      await this.saveUser(user);
      console.log(`[DataStore] Auto-bound LID ${cleanLid} to user ${user.name} (${user.phone})`);
      return true;
    }
    this.usersByPhone.set(cleanLid, user);
    return true;
  }
}

module.exports = new DataStore();
