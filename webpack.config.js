module.exports = {
    entry:"./app/index.js", //codigo de entrada
    output:{
        path: __dirname + '/app/public',
        filename: 'bundle.js'   //donde se va a guardar el codigo convertido y compactado
    },
    module: {
        rules:[
            {
                use:'babel-loader', 
                test: /\.js$/,      //con esto le decimos que tome todos los js que encuentre
                exclude: /node_modules/                
            }
        ]
    }
}