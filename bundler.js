const fs = require('fs');
const babylon = require('babylon');
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const babel = require('babel-core');

const getAssets = (fileName) => {
    const file_content = fs.readFileSync(fileName, 'utf-8');

    // Assymetric Syntax tree
    const ast = babylon.parse(file_content, { sourceType: 'module' })

    const getDependencies = ast.program.body.reduce((prev, curr) => {
        if (curr.type === 'ImportDeclaration') {
            return [...prev, curr.source.value]
        }
        return [...prev]
    }, [])

    const {code} = babel.transformFromAst(ast, null, {
        presets: ['env']
    })

    return {
        id: uuidv4(),
        fileName,
        dependencies: getDependencies,
        code,
    }
}

const createGraphofDependencies = (entryFile) => {
    const mainAssets = getAssets(entryFile)
    
    const queueOfFiles = [mainAssets]

    for (const fileParsed of queueOfFiles) {

        const dirName = path.dirname(fileParsed.fileName)

        fileParsed.mapping = {};

        fileParsed.dependencies.forEach((relativePath) => {
            const absolutePath = path.join(dirName, relativePath + '.js');
            const assets = getAssets(absolutePath);

            fileParsed.mapping[relativePath] = assets.id;

            queueOfFiles.push(assets);
        })
    }
    return queueOfFiles

}   

const bundle = (graph) => {
    let modules = ''

    graph.forEach((mod) => {
        modules += `"${mod.id}": [
            function(require, module, exports) { 
                ${mod.code} 
            }, 
            ${JSON.stringify(mod.mapping)}
        ],`
    })

    const result = `
    (function(modules){
        function require(id) {
            const [fn, mappings] = modules[id];

            function localRequire(relativePath) {
                return require(mappings[relativePath]);
            }

            const module = {exports : {}};

            fn(localRequire, module, module.exports);

            return module.exports;
        }


        require("${graph[0]?.id}")
    })({${modules}})
    `

    return result;
}

const graph = createGraphofDependencies('./Modules/entry.js')

const createBundle = bundle(graph);

console.log(createBundle)