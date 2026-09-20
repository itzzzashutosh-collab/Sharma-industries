import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { User, MessageLog } from '../types';

export class CSVStore {
  private filePath: string;

  constructor(filePath: string) {
    // Resolve to absolute path relative to project root
    this.filePath = join(process.cwd(), filePath);
    this.ensureFile();
  }

  private ensureFile(): void {
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, '');
    }
  }

  private readLines(): string[] {
    if (!existsSync(this.filePath)) {
      return [];
    }
    const content = readFileSync(this.filePath, 'utf-8');
    return content.split('\n').filter(line => line.trim());
  }

  readCSV(): string[][] {
    const lines = this.readLines();
    return lines.map(line => line.split(','));
  }

  readUsers(): User[] {
    const lines = this.readLines();
    // Skip header
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const [lid, name, role, language, active, created_at] = line.split(',');
      return {
        lid: lid.trim(),
        name: name.trim(),
        role: role.trim() as User['role'],
        language: language.trim(),
        active: active.trim() === 'true',
        created_at: created_at.trim()
      };
    });
  }

  appendCSV(row: string[]): void {
    const line = row.join(',');
    const content = this.readLines();
    const newContent = [...content, line].join('\n');
    writeFileSync(this.filePath, newContent);
  }

  updateUser(user: User): void {
    const users = this.readUsers();
    const updatedUsers = users.map(u => u.lid === user.lid ? user : u);
    const header = 'lid,name,role,language,active,created_at';
    const lines = [header, ...updatedUsers.map(u => 
      `${u.lid},${u.name},${u.role},${u.language},${u.active},${u.created_at}`
    )];
    writeFileSync(this.filePath, lines.join('\n'));
  }

  appendMessageLog(log: Omit<MessageLog, 'id'>): string {
    const users = this.readUsers();
    const user = users.find(u => u.lid === log.lid);
    const role = user ? user.role : 'UNKNOWN';
    
    const id = Date.now().toString();
    const line = `${id},${log.lid},${role},${log.raw_message},${log.routed_to},${log.status},${log.created_at}`;
    
    const content = this.readLines();
    const newContent = [...content, line].join('\n');
    writeFileSync(this.filePath, newContent);
    
    return id;
  }
}
