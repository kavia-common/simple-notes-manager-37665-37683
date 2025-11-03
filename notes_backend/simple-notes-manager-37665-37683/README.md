# simple-notes-manager-37665-37683

A simple notes application backend (Express) providing CRUD REST API.

## Run locally

- Container workspace: `simple-notes-manager-37665-37683/notes_backend`
- Default Port: 3001

Commands (run inside notes_backend):
- Install: `npm install`
- Dev: `npm run dev`
- Start: `npm start`

## API Docs

Swagger UI available at: `http://localhost:3001/docs`

OpenAPI JSON: `http://localhost:3001/openapi.json` (generated dynamically using swagger-jsdoc and served via `/docs`)

## Endpoints

Base URL: `http://localhost:3001`

- GET `/` - Health check
- GET `/notes` - List all notes
- GET `/notes/:id` - Fetch a note by id
- POST `/notes` - Create a note
- PUT `/notes/:id` - Update a note
- DELETE `/notes/:id` - Delete a note

All responses are JSON. Errors return a standardized structure:
```
{
  "status": "error",
  "code": "VALIDATION_ERROR|NOT_FOUND|REQUEST_ERROR|INTERNAL_ERROR",
  "message": "Description",
  "details": [ ... ] // optional
}
```

## Request/Response Examples

- List notes:
```
GET /notes
200 OK
{
  "status": "success",
  "data": [
    { "id": 1, "title": "Note", "content": "Body", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

- Create note:
```
POST /notes
Content-Type: application/json

{
  "title": "My first note",
  "content": "This is the content"
}

201 Created
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "My first note",
    "content": "This is the content",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

- Update note:
```
PUT /notes/1
Content-Type: application/json

{
  "title": "Updated title"
}

200 OK
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Updated title",
    "content": "This is the content",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

- Delete note:
```
DELETE /notes/1
204 No Content
```

## Persistence

Notes are stored in-memory and persisted to a JSON file under `notes_backend/data/notes.json` when possible. No external services or credentials required.

## Validation

- POST /notes requires non-empty `title` and `content` strings.
- PUT /notes/:id requires at least one of `title` or `content`, and any provided field must be a non-empty string.

## Error Handling

- 404 for unknown routes and missing notes
- Centralized error handler ensures consistent JSON responses
