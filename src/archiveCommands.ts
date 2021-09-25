interface ArchiveCompetitor {
	add: string
	addHigh?: string
	addLow?: string
	extract: string
}

const archiveCommands: Record<string, ArchiveCompetitor> = {
	zip: { add: "zip -r $o $i", extract: "unzip $i -d $o" },
}
export default archiveCommands
