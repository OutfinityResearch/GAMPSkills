# update-specs

## Intents
The update-specs skill directly modifies specification files under `./docs/specs` based on the user prompt. It does not use the backlog system — changes are applied immediately.

## Preparation
1. Use context-loader to list all files in `./docs/specs` and load specification files relevant to the user prompt. Also include `./AGENTS.md`.

## Allowed Preparation Skills
- context-loader

## Instructions
1. From the loaded context, determine which specification files need to be modified based on the user prompt.
2. For each file that needs modification, first read the file to get initial content, then call ds-expert with:
   - the full loaded context  for cross-file reference
   - the original file content to be updated
   - the user prompt
   - a brief note listing which files have already been updated and what change was intended, so ds-expert maintains cross-file consistency
   to generate the full updated content for that file.
3. Write the updated content to the same file path using file-system writeFile.
4. Do not modify files that are not affected by the user prompt.

- Each skill call handles only ONE operation.
- Process files one at a time: generate content → write → next file.
- ds-expert must receive the full original file content as context, not just a summary. Pass the original content as a separate argument, not embedded in a quoted string.
- When calling ds-expert for the Nth file, include a note like: "The following files have already been updated for this change: [list]. Ensure your output is consistent with those updates."
- The change intent summary is derived from the user prompt, not from the actual generated content.

## Allowed Skills
- ds-expert
- file-system
