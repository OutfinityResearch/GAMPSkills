# Specification for index.js

## Module Description
This module serves as the central entry point for the GAMP-RSP skill. It sets up a facade pattern to expose a unified and simplified API for a collection of more complex underlying managers. The primary export is an `action` function, which is designed to be the single point of contact for the Code Specs Subsystem, dynamically dispatching calls to the appropriate methods on the facade.

## Dependencies
-   `./GampRSPCore.mjs`: Imports the `GampRSPCore` class.
-   `./DocumentManager.mjs`: Imports the `DocumentManager` class.
-   `./DSManager.mjs`: Imports the `DSManager` class.
-   `./ReportingManager.mjs`: Imports the `ReportingManager` class.

---

## Class: GampRSPFacade

### Description
The `GampRSPFacade` class orchestrates the entire GAMP-RSP feature set. It instantiates all the manager classes (`GampRSPCore`, `DocumentManager`, `DSManager`, `ReportingManager`) and binds their public methods directly to the facade instance. This allows a caller to access any manager's method (e.g., `createURS` from `DocumentManager`) as if it were a method of the facade itself (e.g., `gampRSP.createURS(...)`).

### Constructor Logic
1.  An instance of `GampRSPCore` is created and stored.
2.  An instance of `DocumentManager` is created, passing the core instance to it.
3.  An instance of `DSManager` is created, passing the core and document manager instances to it.
4.  An instance of `ReportingManager` is created, passing the core and document manager instances to it.
5.  A `bindMethods` helper function is called for each manager to attach its public methods to the facade instance.

### Method Binding (`bindMethods`)
This internal helper function is responsible for the core of the facade pattern.
-   **Input**: A source object (the manager instance) and an array of method names (strings).
-   **Process**: It iterates through the array of method names. For each name, it checks if a function with that name exists on the source object. If it does, it binds that function to the source object's context (`source[methodName].bind(source)`) and assigns it as a property on the `GampRSPFacade` instance (`this`). This ensures that when a method is called from the facade, its `this` context correctly refers to the original manager instance.

#### Bound Methods
-   **From `GampRSPCore`**: `configure`, `getSpecsDirectory`, `getDSDir`, `getMockDir`, `getDocsDir`, `getMatrixPath`, `getIgnorePath`, `readIgnoreList`, `addIgnoreEntries`, `readCache`, `writeCache`, `resolveDSFilePath`.
-   **From `DocumentManager`**: `createURS`, `updateURS`, `retireURS`, `createFS`, `updateFS`, `obsoleteFS`, `createNFS`, `updateNFS`, `obsoleteNFS`, `readDocument`, `writeDocument`, `linkRequirementToDS`.
-   **From `DSManager`**: `createDS`, `updateDS`, `listDSIds`, `createTest`, `updateTest`, `deleteTest`, `describeFile`, `findDSByTest`, `nextTestId`, `getDSFilePath`.
-   **From `ReportingManager`**: `refreshMatrix`, `generateHtmlDocs`, `loadSpecs`.

---

## Function: action(args)

### Description
This is the main exported function and the designated entry point for execution by the parent system. It acts as a dynamic dispatcher that invokes a method on the global `gampRSP` facade instance based on runtime arguments.

### Input
-   `args` (Object): An object that specifies the operation to perform.
    -   `method` (string, mandatory): The name of the method to call on the `gampRSP` facade.
    -   `params` (array, optional): An array of arguments to be passed to the target method. Defaults to an empty array if not provided.

### Processing Logic
1.  The function is asynchronous.
2.  It receives an `args` object.
3.  It destructures the `method` and `params` properties from the `args` object. The `params` property is given a default value of an empty array.
4.  It checks if the `method` string corresponds to a function that exists on the singleton `gampRSP` instance.
5.  **If the method exists**: It calls the method on the `gampRSP` object, using the spread operator (`...`) to pass the elements of the `params` array as individual arguments. The `await` keyword is used to handle the possibility of the called method being asynchronous. The return value of the called method is then returned by the `action` function.
6.  **If the method does not exist**: It throws an `Error` with a message indicating that the specified method was not found or exposed on the facade.