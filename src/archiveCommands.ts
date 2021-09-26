interface ArchiveCompetitor {
	add: string
	addHigh?: string
	addLow?: string
	extract: string
}

const archiveCommands: Record<string, ArchiveCompetitor> = {
	zip: { add: "zip -r $o $i", extract: "unzip $i -d $o" },
	rar: { add: "rar a $o $i", extract: "rar x $i $o/" },
	"7z": { add: "7z a $o $i", extract: "7z x $i $o/" },
}

archiveCommands["tar.gz"] =
	archiveCommands["tar.z"] =
	archiveCommands["tar.bz2"] =
	archiveCommands["tar.tlz"] =
	archiveCommands["tar.lzo"] =
	archiveCommands["tar.xz"] =
	archiveCommands["tar.zst"] =
		{ add: "tar caf $o $i", extract: "tar xf $i -C $o" }

export default archiveCommands
