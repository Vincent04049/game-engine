const fs = require('fs')
const path = require('path')

function createFileAndFolderStructure(destPath, content) {
	const folderPath = path.dirname(destPath)

	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true })
	}

	fs.writeFileSync(destPath, content)
}

function countOccurrences(inputString, substring) {
	let count = 0
	let index = inputString.indexOf(substring)

	while (index !== -1) {
		count++
		index = inputString.indexOf(substring, index + 1)
	}

	return count
}


let u = 0
function uuid() {
	u += 1
	return u
}

const jsFiles = require('./get_js_files')
const Imports = require('./Imports')

for (const srcPath of jsFiles) {
	let content = fs.readFileSync(srcPath, 'utf-8')
	const destPath = path.join('dist/static', path.relative('static', srcPath))

	let imports = ''
	let steps = ''
	for (const jsFilePath of jsFiles) {
		const className = path.basename(jsFilePath, '.js')
		const i = `import { ${className} } from '/${jsFilePath}'`

		if (Imports.include(content, className)) {
			imports += i + ';\n'
		}
	}

	content = content.replaceAll('RunOnce(', 'RunOnce(this, TEMP_UUID, ')
	let count = countOccurrences(content, 'TEMP_UUID')
	for (let i = 0; i < count; i++) {
		content = content.replace('TEMP_UUID', uuid())
	}

	content = content.replaceAll('RunUntil(', 'RunUntil(this, TEMP_UUID_1, ')
	for (let i = 0; i < countOccurrences(content, 'TEMP_UUID_1'); i++) {
		content = content.replace('TEMP_UUID_1', uuid())
	}

	const match = content.match(/export\s+class\s+\w+\s*{\s*constructor\s*\(([^)]*)\)/)

	if (match) {
		const parameters = match[1].split(',')
			.map(param => param.trim())
			.map(p => p.replaceAll(' ', ''))
			.map(p => p.split('=')[0])

		if (!(parameters.length == 1 && parameters[0] == '')) {

			const initVariables = parameters
				.map(p => `this.${p} = ${p}; \n`)
				.map(p => '\t\t' + p)
				.join()
				.replaceAll(',', '')

			let lines = content.split('\n')
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].includes('constructor') && !lines[i].includes('IGNORE')) {
					lines[i] = lines[i] + '\n' + initVariables
				}

				if (lines[i].trim() == 'Steps') {
					steps += 'const __steps = new Steps()' + '\n'
					lines[i] = '\t\t__steps.update()'

					const stepImport = 'import { Steps } from \'/static/engine/Steps.js\';'
					if (!imports.includes(stepImport)) {
						imports += stepImport + '\n'
					}
				}
			}

			content = lines.join('\n')
		}
	}

	content = imports + '\n' + steps + '\n' + content

	createFileAndFolderStructure(destPath, content)
}

require('./copy_asset_folder_to_dist')

const scriptImports = jsFiles.map(f => `<script type="module" src="/${f}"></script>`).join('\n')

const indexHtml = fs.readFileSync('templates/index.html', 'utf-8')
	.replace('SCRIPT_IMPORTS', scriptImports)

fs.writeFileSync('dist/index.html', indexHtml)
