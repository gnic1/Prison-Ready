# Story Content

Mission authoring files live here as JSON source files.

Workflow:

1. Edit mission files in the admin dashboard or directly in JSON.
2. Run `npm run stories:compile`.
3. The compiler writes runtime content to `src/features/missions/data/generatedContent.ts`.
4. The app reads generated runtime content through `MissionRepository`.

Each mission file contains:

- top-level mission metadata
- overview and briefing transcript
- ordered beats with time or route-progress triggers
- side mission definitions
- artifact payload
- report-back options

Authoring files are optimized for editing.
Generated runtime files are optimized for app consumption.
