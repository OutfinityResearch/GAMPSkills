# GAMP-RSP System Facade

Manages a GAMP-RSP compliant documentation system through a dynamic method invocation interface.

## Summary
This skill acts as a high-level facade for a comprehensive GAMP-RSP (Good Automated Manufacturing Practice - Requirements, Specifications, and Planning) documentation system. It orchestrates the creation, modification, and reporting of software validation documents, including User Requirements (URS), Functional/Non-Functional Specifications (FS/NFS), and Design Specifications (DS). All operations are accessed through a single, dynamic entry point that dispatches calls to the appropriate underlying managers.

## Input Format
The skill is invoked via an `action` function that accepts a single object specifying the operation to be performed.

- **args** (Object): The container for the command.
  - `method` (string, mandatory): The exact name of the GAMP-RSP function to execute. This corresponds to a method on the `GampRSPFacade`.
  - `params` (array, optional): An array of arguments to be passed to the specified method. The number, type, and order of elements must match the signature of the target method.

## Output Format
- **Type**: `any`
- **Description**: The output is dynamic and depends entirely on the `method` invoked. The returned value is the result of the underlying facade method call.
- **Success Examples**:
  - **ID Creation**: May return a string representing a new unique ID, like `"URS-001"` or `"DS-001"`.
  - **Data Retrieval**: May return an array of strings, such as `["DS-001", "DS-002"]` when listing IDs.
  - **File Operations**: May return a string containing a file path, like `"/path/to/.specs/matrix.md"`.
  - **Complex Queries**: May return a long string containing the content of multiple specification documents.
  - **Void Operations**: May return `undefined` for methods that only perform file system writes and have no explicit return value.
- **Error Example**: An error is thrown if the method does not exist. Example: `"Error: Method 'nonExistentMethod' not found or not exposed."`

## Constraints
- The `method` name provided in the input must be a case-sensitive, exact match for a method exposed on the `GampRSPFacade`.
- The `params` array must provide all required arguments in the correct order and with the correct data types as expected by the target method signature.
- The skill requires read/write access to the file system within the workspace, specifically to create and manage files and directories within the `.specs` folder.
