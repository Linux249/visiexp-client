const WorkerPlugin = require('worker-plugin');

module.exports = {
    devServer: {
        proxy: 'http://localhost:3000',
    },
    configureWebpack: {
        plugins: [
            new WorkerPlugin(),
        ],
        // module: {
        //     rules: [
        //         {
        //             test: /\.worker\.js$/,
        //             use: {
        //                 loader: 'worker-loader',
        //                 options: {
        //                     inline: true,
        //                     fallback: false,
        //                     name: 'WorkerName.[hash].js',
        //                 },
        //             },
        //         },
        //     ],
        // },
    },
};
