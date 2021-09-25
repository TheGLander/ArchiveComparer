import { execSync } from "child_process"
import { readdirSync, mkdtempSync, rmSync, statSync } from "fs"
import { sep, join } from "path"
import { tmpdir } from "os"
import archiveCommands from "./archiveCommands"

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

function runCompressionTest(
	testName: string,
	command: string,
	compressDir: string
): [compressionRate: number, timeSpent: number] {
	console.log(`Running compression test ${testName}...`)
	const oldSize = countFilesizeInDirectory(compressDir),
		newFile = `${tempDir}${sep}${testName}`
	const timeSpent = timeFunction(() =>
		execSync(formatCommand(command, compressDir, newFile))
	)
	return [oldSize / statSync(newFile).size, timeSpent]
}

function runExtractionTest(
	testName: string,
	command: string
): [timeSpent: number] {
	console.log(`Running extraction test ${testName}...`)
	const newDir = `${tempDir}${sep}${Date.now()}`
	const timeSpent = timeFunction(() =>
		execSync(formatCommand(command, `${tempDir}${sep}${testName}`, newDir))
	)
	rmSync(newDir, { recursive: true })
	return [timeSpent]
}

console.log(
	runCompressionTest("compress.zip", archiveCommands.zip.add, "testfiles/text")
)
console.log(runExtractionTest("compress.zip", archiveCommands.zip.extract))
