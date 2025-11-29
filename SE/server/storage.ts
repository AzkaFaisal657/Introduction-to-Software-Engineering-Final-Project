import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, any>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }
}

export const storage = new MemStorage();