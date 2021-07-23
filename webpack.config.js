// required for path resolution for dist folder
const path = require('path')
// used to access the BannerPlugin
const webpack = require('webpack')
// required for pretty format for the Userscript banner
const stripIndent = require('common-tags').stripIndent

const usHeader = require('./userscriptHeader.js')

module.exports = {
	entry: './src/core.ts',
	// devtool: 'inline-source-map',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bahamut-guild-v2-toolkit.user.js',
	},
	plugins: [
		new webpack.BannerPlugin({
			raw: true,
			banner: stripIndent(usHeader),
		}),
	],
	optimization: {
		minimize: false,
	},
}
