const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    plugins: [
        new HtmlWebpackPlugin({})
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '...']
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        rootMode: "upward",
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.(c|sa|sc)ss$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                auto: true,
                                exportLocalsConvention: 'camelCaseOnly',
                                localIdentName: '[path][name]__[local]--[hash:base64:5]'
                            },
                            importLoaders: 1
                        }
                    },
                    'sass-loader'
                ]
            }
        ]
    },
    devServer: {
        port: 7123
    }
};