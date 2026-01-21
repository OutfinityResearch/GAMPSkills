# Backlog IO Skill - Implementation Specification

## Purpose
The backlog-io skill provides a complete interface to the BacklogManager module, enabling the Achilles agent to manage project backlogs (specs and docs) through structured operations for tracking issues, proposals, resolutions, and section management.

## Capabilities

### Backlog Loading
- **loadBacklog**: Load entire backlog with sections and metadata
- **getSection**: Retrieve specific section by file key

### Issue Management
- **recordIssue**: Add new issue to a section
- **proposeFix**: Add new proposal/option to a section
- **approveResolution**: Set resolution text for a section

### Section Discovery
- **findSectionsByPrefix**: Find all sections matching path prefix
- **findSectionByFileName**: Find section by file name
- **findSectionsByStatus**: Find all sections with specific status

### Section Modification
- **setStatus**: Update section status
- **updateSection**: Apply partial updates to section
- **appendSection**: Create new section in backlog

## Input Contract
```javascript
{
  operation: string,        // Required: operation type
  type: string,            // Required: 'specs' or 'docs'
  fileKey?: string,        // Optional: section identifier
  issue?: object,          // Optional: issue object {title, details}
  proposal?: object,       // Optional: proposal object {title, details}
  resolution?: string,     // Optional: resolution text
  prefix?: string,         // Optional: path prefix for search
  fileName?: string,       // Optional: file name for search
  status?: string,         // Optional: status value
  updates?: object,        // Optional: partial section updates
  initialContent?: string  // Optional: initial description for new section
}
```

## Output Contract
- Objects for load/get operations: `{ sections, meta }` or section object
- Arrays for find operations: `[fileKey1, fileKey2, ...]`
- Success messages for modification operations
- Throws Error with descriptive message on failure

## Implementation Details

### BacklogManager Integration
- Direct import from `../../../BacklogManager/BacklogManager.mjs`
- All operations delegate to corresponding BacklogManager functions
- No business logic in skill layer - pure delegation

### Operation Routing
- Switch-case structure maps operation names to BacklogManager calls
- Parameters are passed through without transformation
- Return values are passed back directly

### Error Handling
- Invalid operation throws error with operation name
- BacklogManager errors propagate unchanged
- Missing required parameters handled by BacklogManager

### Dependencies
- `BacklogManager`: All exported functions (loadBacklog, getSection, recordIssue, proposeFix, approveResolution, findSectionsByPrefix, findSectionByFileName, findSectionsByStatus, setStatus, updateSection, appendSection)

## Code Generation Guidelines
When regenerating this skill:
1. Maintain switch-case structure for operation routing
2. Keep all operations async
3. Import all BacklogManager functions as namespace
4. Pass parameters directly without transformation
5. Return BacklogManager results unchanged
6. Add success messages only for void operations
7. Validate only operation parameter existence
8. Let BacklogManager handle type and parameter validation
