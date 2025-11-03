'use strict';

const store = require('../models/noteStore');
const { validationError } = require('../middleware/errorHandler');

class NotesController {
  // PUBLIC_INTERFACE
  /**
   * list
   * GET /notes
   * Returns list of notes.
   */
  list(req, res) {
    const notes = store.list();
    return res.status(200).json({
      status: 'success',
      data: notes,
    });
    }

  // PUBLIC_INTERFACE
  /**
   * get
   * GET /notes/:id
   * Fetch a note by id.
   */
  get(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(validationError('Invalid note id', { param: 'id' }));
    const note = store.getById(id);
    if (!note) {
      const err = new Error('Note not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    return res.status(200).json({
      status: 'success',
      data: note,
    });
  }

  // PUBLIC_INTERFACE
  /**
   * create
   * POST /notes
   * Create a new note.
   * Body: { title: string, content: string }
   */
  create(req, res, next) {
    const { title, content } = req.body || {};
    const details = [];
    if (typeof title !== 'string' || title.trim() === '') {
      details.push({ field: 'title', message: 'title is required and must be a non-empty string' });
    }
    if (typeof content !== 'string' || content.trim() === '') {
      details.push({ field: 'content', message: 'content is required and must be a non-empty string' });
    }
    if (details.length) return next(validationError('Invalid request body', details));

    const note = store.create({ title: title.trim(), content: content.trim() });
    return res.status(201).json({
      status: 'success',
      data: note,
    });
  }

  // PUBLIC_INTERFACE
  /**
   * update
   * PUT /notes/:id
   * Update an existing note.
   * Body: { title?: string, content?: string } - at least one required
   */
  update(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(validationError('Invalid note id', { param: 'id' }));

    const { title, content } = req.body || {};
    if ((title === undefined || title === null) && (content === undefined || content === null)) {
      return next(validationError('At least one of title or content must be provided'));
    }
    const details = [];
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      details.push({ field: 'title', message: 'title, if provided, must be a non-empty string' });
    }
    if (content !== undefined && (typeof content !== 'string' || content.trim() === '')) {
      details.push({ field: 'content', message: 'content, if provided, must be a non-empty string' });
    }
    if (details.length) return next(validationError('Invalid request body', details));

    const updated = store.update(id, {
      title: title !== undefined ? title.trim() : undefined,
      content: content !== undefined ? content.trim() : undefined,
    });
    if (!updated) {
      const err = new Error('Note not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    return res.status(200).json({
      status: 'success',
      data: updated,
    });
  }

  // PUBLIC_INTERFACE
  /**
   * remove
   * DELETE /notes/:id
   * Delete a note by id.
   */
  remove(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(validationError('Invalid note id', { param: 'id' }));
    const ok = store.remove(id);
    if (!ok) {
      const err = new Error('Note not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }
    return res.status(204).send();
  }
}

module.exports = new NotesController();
