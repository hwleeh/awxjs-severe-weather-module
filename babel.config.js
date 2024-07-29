module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                esmodules: true
            },
            useBuiltIns: false,
            corejs: false,
            modules: false // This prevents transformation of ES6 modules to CommonJS
        }],
        ['@babel/preset-typescript', {
            allowNamespaces: true
        }]
    ],
    plugins: [
        ['@babel/plugin-transform-typescript', {
            allowDeclareFields: true
        }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-syntax-dynamic-import'
    ]
};
