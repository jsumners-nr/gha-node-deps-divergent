'use strict'

const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')

const os = require('os')
const path = require('path')

main()

async function main() {
	// Silly issue https://github.com/actions/toolkit/issues/518
	const tmpDir = process.env.RUNNER_TEMP || os.tmpdir()

	// @actions/checkout is not bringing in the list of remotes
	// so let's do it ourselves.
	await exec.exec('git fetch origin')

	const currentSha = core.getInput('current-sha')
	const baseSha = core.getInput('base-sha')

	const basePkgFile = path.join(tmpDir, 'base-package.json')
	await exec.exec(`git checkout origin/${baseSha}`)
	await io.cp('package.json', basePkgFile)

	const currentPkgFile = path.join(tmpDir, 'current-package.json')
	await exec.exec(`git checkout ${currentSha}`)
	await io.cp('package.json', currentPkgFile)

	const basePkg = require(basePkgFile)
	const currPkg = require(currentPkgFile)

	const pkgName = core.getInput('package-name')
	const pkgType = core.getInput('package-type')
	if (pkgName) {
		let fieldPath
		switch (pkgType) {
			default:
			case 'base': {
				fieldPath = 'dependencies'
				break
			}
			case 'dev': {
				fieldPath = 'devDependencies'
				break
			}
			case 'peer': {
				fieldPath = 'peerDependencies'
				break
			}
			case 'optional': {
				fieldPath = 'optionalDependencies'
				break
			}
		}
		if (basePkg[fieldPath][pkgName] !== currPkg[fieldPath][pkgName]) {
			core.setOutput('divergent', 'true')
		} else {
			core.setOutput('divergent', 'false')
		}
		return
	}


	let divergent = isDivergent(basePkg.dependencies, currPkg.dependencies)
	if (divergent === true) {
		core.setOutput('divergent', 'true')
		return
	}

	divergent = isDivergent(basePkg.devDependencies, currPkg.devDependencies)
	if (divergent === true) {
		core.setOutput('divergent', 'true')
		return
	}

	divergent = isDivergent(basePkg.peerDependencies, currPkg.peerDependencies)
	if (divergent === true) {
		core.setOutput('divergent', 'true')
		return
	}

	divergent = isDivergent(basePkg.optionalDependencies, currPkg.optionalDependencies)
	core.setOutput('divergent', divergent === true ? 'true' : 'false')
}

function isDivergent(baseline = {}, target = {}) {
	const baseKeys = Object.keys(baseline)
	const targetKeys = Object.keys(target)
	
	if (baseKeys.length !== targetKeys.length) {
		return true
	}

	for (const [key, value] of Object.entries(baseline)) {
		if (Object.prototype.hasOwnProperty.call(target, key) === false) {
			return true
		}
		if (target[key] !== value) {
			return true
		}
	}

	return false
}