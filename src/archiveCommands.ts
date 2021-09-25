interface ArchiveCompetitor {
	add: string
	addHigh?: string
	addLow?: string
	extract: string
}

const archiveCommands: Record<string, ArchiveCompetitor> = {
	zip: { add: "zip -r $o $i", extract: "unzip $i -d $o" },
	rar: { add: "rar a $o $i", extract: "rar x $i $o/" },
	"tar.gz": { add: "tar caf $o $i", extract: "tar xf $i -C $o" },
}
export default archiveCommands
