# update-specs

## Intents
The update-specs skill directly modifies specification files under `./docs/specs` based on the user prompt. It does not use the backlog system — changes are applied immediately.

## Preparation
1. Use context-loader to load specification files relevant to the user prompt.
   options: {"dir": "./docs/specs", "filter": "*.md"}
   Store the result as @context_specs.

## Instructions
1. From the loaded context ($context-piece-1), determine which specification files need to be modified based on the user prompt.
2. For each file that needs modification, call ds-expert with:
   - the full loaded context ($context-piece-1) for cross-file reference
   - the original file content to be updated
   - the user prompt
   - a brief note listing which files have already been updated and what change was intended, so ds-expert maintains cross-file consistency
   to generate the full updated content for that file.
3. Write the updated content to the same file path using file-system writeFile.
4. Do not modify files that are not affected by the user prompt.

- Each skill call handles only ONE operation.
- Process files one at a time: generate content → write → next file.
- ds-expert must receive the full original file content as context, not just a summary.
- The written content must be the complete file, not a partial patch.
- When calling ds-expert for the Nth file, include a note like: "The following files have already been updated for this change: [list]. Ensure your output is consistent with those updates."
- The change intent summary is derived from the user prompt, not from the actual generated content.

## Allowed Skills
- context-loader
- ds-expert
- file-system
