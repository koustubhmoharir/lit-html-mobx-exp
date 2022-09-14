const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './index.ts',
    externalsPresets: { node: true },
    externals: [nodeExternals({
        modulesFromFile: true
    })],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'commonjs-static'
        },
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '...']
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: [/node_modules/, path.resolve(__dirname, 'dist')],
                use: {
                    loader: 'babel-loader',
                    options: {
                        rootMode: "upward",
                        cacheDirectory: true
                    }
                }
            }
        ]
    },
    devServer: {
        port: 7123
    }
};