# Explanation just for reference

## File Dependency

Modules -> entry -> level2 -> level3


### getAssets Function

- Takes fileName as a parameter (This fileName is relative path)
- We read the file synchronously and get content of file
- We parse the file content using `babylon` to create an AST ( Assymetric Syntax tree). 
    - `Why Do we need to create an AST` ?
    
        We need all the dependencies required in the particular file and also the dependencies of dependencies until we reach every last file (say leaf Node) which has no further dependencies. This can be extracted using alternatives like regex to get fileNames. But AST helps parse the whole file to get exact required dependencies of particular file.
- The AST contains `ImportDeclaration` which has the list of all the dependenies of a particluar file
- We also convert the code to commonJS using babel
- This function return 4 things, a unique ID to every fileName, the name of file, the array of dependencies (relative path), and the babel code

### createGraphofDependencies function

- We call  `getAssets` function  to get assets of our entry file which is `entry.js`
- We maintain a queue. Since we need to go through all the dependencies of file, scan that file, get their dependencies and so on...
- We loop through the queue until we reach all the leaf Nodes which do not have any dependencies.
- We also maintain a `mapping`, which tells which files have which dependencies, somewhat like connecting those graphs.

### bundle

- This is the final function which provides the output.
- This takes the graph, returns a self invoking function with `graph` as a parameter.
- Inside the self invoking function, we create a `require` function which inturn calls the parsed code from babel.


