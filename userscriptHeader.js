const pkg = require('./package.json')

const metadata = {
	name: pkg.displayName,
	namespace: pkg.homepage,
	version: pkg.version,
	description: pkg.description,
	author: pkg.author,
	contributors: pkg.contributors,
	include: [
		// '/guild.gamer.com.tw/guild.php',
		'/guild.gamer.com.tw/post_detail.php',
	],
	grant: ['GM_notification'],
	updateUrl: [
		'https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/bahamut-guild-v2-toolkits.user.js',
	],
}

const maxKeyLength = Math.max(...Object.keys(metadata).map((key) => key.length))
const metadataLine = (key, value) =>
	`// ${`@${key}`.padEnd(maxKeyLength + 4)} ${value}`

module.exports = [
	'// ==UserScript==',
	...Object.keys(metadata).map((key) => {
		const value = metadata[key]
		if (Array.isArray(value)) {
			return value.map((item) => metadataLine(key, item)).join('\n')
		}

		return metadataLine(key, value)
	}),
	'// ==/UserScript==',
	'',
	'',
].join('\n')
