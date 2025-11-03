'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // ignore; fallback to in-memory only
  }
}

/**
 * NoteStore provides a minimal persistence layer backed by a JSON file.
 * It maintains an in-memory cache and periodically flushes to disk on write operations.
 */
class NoteStore {
  constructor() {
    this.notes = [];
    this.nextId = 1;
    ensureDataDir();
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw || '[]');
        this.notes = Array.isArray(parsed) ? parsed : [];
        // compute nextId
        const maxId = this.notes.reduce((max, n) => Math.max(max, Number(n.id) || 0), 0);
        this.nextId = maxId + 1;
      }
    } catch (e) {
      // fallback to empty; do not crash server
      this.notes = [];
      this.nextId = 1;
    }
  }

  _persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.notes, null, 2), 'utf-8');
    } catch (e) {
      // ignore persistence errors; still serve from memory
    }
  }

  // PUBLIC_INTERFACE
  /**
   * list
   * Returns all notes.
   * @returns {Array<{id:number,title:string,content:string,createdAt:string,updatedAt:string}>}
   */
  list() {
    return this.notes;
  }

  // PUBLIC_INTERFACE
  /**
   * getById
   * Returns a note by id or null if not found.
   * @param {number} id
   */
  getById(id) {
    return this.notes.find(n => Number(n.id) === Number(id)) || null;
  }

  // PUBLIC_INTERFACE
  /**
   * create
   * Creates a note and persists it.
   * @param {{title:string, content:string}} payload
   */
  create(payload) {
    const now = new Date().toISOString();
    const note = {
      id: this.nextId++,
      title: payload.title,
      content: payload.content,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(note);
    this._persist();
    return note;
  }

  // PUBLIC_INTERFACE
  /**
   * update
   * Updates a note and persists it. Returns updated note or null if not found.
   * @param {number} id
   * @param {{title?:string, content?:string}} payload
   */
  update(id, payload) {
    const note = this.getById(id);
    if (!note) return null;
    if (typeof payload.title === 'string') note.title = payload.title;
    if (typeof payload.content === 'string') note.content = payload.content;
    note.updatedAt = new Date().toISOString();
    this._persist();
    return note;
  }

  // PUBLIC_INTERFACE
  /**
   * remove
   * Deletes a note. Returns true if deleted, false otherwise.
   * @param {number} id
   */
  remove(id) {
    const idx = this.notes.findIndex(n => Number(n.id) === Number(id));
    if (idx === -1) return false;
    this.notes.splice(idx, 1);
    this._persist();
    return true;
  }
}

module.exports = new NoteStore();
