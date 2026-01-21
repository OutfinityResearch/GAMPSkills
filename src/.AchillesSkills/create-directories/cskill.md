# create-directories

## Description
Creates a directory tree recursively, ensuring all specified paths exist. Takes an array of absolute or relative directory paths and creates them if they don't exist, handling nested structures.

## Instructions
Validate the input as an array of strings representing directory paths. For each path, use the file system to create the directory recursively, allowing for parent directories to be created as needed. Handle any permission or path errors gracefully, and confirm successful creation.