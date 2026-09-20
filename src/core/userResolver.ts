import { User } from '../types';
import { CSVStore } from '../storage/csvStore';

export class UserResolver {
  private store: CSVStore;

  constructor(store: CSVStore) {
    this.store = store;
  }

  getUserByLID(lid: string): User | null {
    const users = this.store.readUsers();
    return users.find(user => user.lid === lid) || null;
  }

  getUserRole(lid: string): User['role'] {
    const user = this.getUserByLID(lid);
    return user ? user.role : 'UNKNOWN';
  }

  getUserLanguage(lid: string): string {
    const user = this.getUserByLID(lid);
    return user ? user.language : 'english';
  }

  isUserActive(lid: string): boolean {
    const user = this.getUserByLID(lid);
    return user ? user.active : false;
  }
}