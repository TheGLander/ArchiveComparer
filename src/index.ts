import { execSync } from "child_process"
import { readdirSync, mkdtempSync, mkdirSync, rmSync, statSync } from "fs"
import { sep, join, relative } from "path"
import { tmpdir } from "os"
import archiveCommands from "./archiveCommands"

const TEST_FILES = "testfiles",
	TRIALS_N = 5

const tempDir = mkdtempSync(tmpdir() + sep)

function timeFunction(func: () => void): number {
	const now = Date.now()
	func()
	return Date.now() - now
}

function formatCommand(command: string, input: string, output: string): string {
	return command.replace("$i", input).replace("$o", output)
}

function countFilesizeInDirectory(dir: string): number {
	return readdirSync(dir).reduce((acc, val) => {
		const fileStat = statSync(join(dir, val))
		return (
			acc +
			(fileStat.isDirectory()
				? countFilesizeInDirectory(join(dir, val))
				: fileStat.size)
		)
	}, 0)
}

export interface CompressionResult {
	archiver: string
	test: string
	timeSpent: number
	compressionRate: number
}

function runCompressionTest(
	archiver: string,
	test: string,
	command: string,
	compressDir: string
): CompressionResult {
	const oldSize = countFilesizeInDirectory(compressDir),
		newFile = `${tempDir}${sep}${test}.${archiver}`
	const timeSpent = timeFunction(() =>
		execSync(formatCommand(command, compressDir, newFile))
	)
	return {
		archiver,
		test,
		compressionRate: oldSize / statSync(newFile).size,
		timeSpent,
	}
}

export interface ExtractionResult {
	archiver: string
	test: string
	timeSpent: number
}

function runExtractionTest(
	archiver: string,
	test: string,
	command: string
): ExtractionResult {
	const newDir = `${tempDir}${sep}${Date.now()}`
	mkdirSync(newDir)
	const timeSpent = timeFunction(() =>
		execSync(
			formatCommand(command, `${tempDir}${sep}${test}.${archiver}`, newDir)
		)
	)
	rmSync(newDir, { recursive: true })
	return {
		archiver,
		test,
		timeSpent,
	}
}

const compressionRecords: Record<string, Record<string, CompressionResult>> = {}
const extractionRecords: Record<string, Record<string, ExtractionResult>> = {}
for (let i = 0; i < TRIALS_N; i++) {
	console.log(`Trial ${i + 1}/${TRIALS_N}`)
	for (const test of readdirSync(TEST_FILES)) {
		compressionRecords[test] ??= {}
		extractionRecords[test] ??= {}
		for (const archiver in archiveCommands) {
			console.log(`Running compression test ${test}.${archiver}...`)
			const cstats = runCompressionTest(
				archiver,
				test,
				archiveCommands[archiver].add,
				relative(process.cwd(), join(TEST_FILES, test))
			)
			if (compressionRecords[test][archiver]) {
				compressionRecords[test][archiver].compressionRate +=
					cstats.compressionRate
				compressionRecords[test][archiver].timeSpent += cstats.timeSpent
			} else compressionRecords[test][archiver] = cstats
			console.log(`Running extraction test ${test}.${archiver}...`)
			const xstats = runExtractionTest(
				archiver,
				test,
				archiveCommands[archiver].extract
			)
			extractionRecords[test][archiver] = xstats
		}
	}
}
for (const test in compressionRecords) {
	console.log(
		`Speediest ${test} compression: ${
			Object.values(compressionRecords[test]).reduce(
				(acc, val) => (acc.timeSpent > val.timeSpent ? val : acc),
				compressionRecords[test].zip
			).archiver
		}`
	)
	console.log(
		`Best quality ${test} compression: ${
			Object.values(compressionRecords[test]).reduce(
				(acc, val) => (acc.compressionRate > val.compressionRate ? acc : val),
				compressionRecords[test].zip
			).archiver
		}`
	)
	console.log(
		`Speediest ${test} extraction: ${
			Object.values(extractionRecords[test]).reduce(
				(acc, val) => (acc.timeSpent > val.timeSpent ? val : acc),
				extractionRecords[test].zip
			).archiver
		}`
	)
}

rmSync(tempDir, { recursive: true })
