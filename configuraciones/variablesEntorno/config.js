'use strict'
require('dotenv').config()

module.exports = {
    usuarioBaseDatos: process.env.USUARIO_BD,
    contrasenaBaseDatos: process.env.CONTRASENA_BD,
    port: process.env.PORT,
    baseDeDatos: process.env.BDD,
    // db: process.env.MONGODB || 'mongodb://heroku_fvl252wx:gakfd0igg6ip2uis644h09uq13@ds123399.mlab.com:23399/heroku_fvl252wx',
    SECRET_TOKEN: 'mysecret',
    frontend: process.env.FRONTEND
    
}
// Backup de la base de datos: Mongo Lab
// mongodump -h ds123399.mlab.com:23399 -d heroku_fvl252wx -u heroku_fvl252wx -p gakfd0igg6ip2uis644h09uq13 -o <output directory>


// mongorestore --host erpDevelope-shard-0/erpdevelope-shard-00-00-tfhcs.mongodb.net:27017,erpdevelope-shard-00-01-tfhcs.mongodb.net:27017,erpdevelope-shard-00-02-tfhcs.mongodb.net:27017 --db ivvuo-prod --ssl --username desarrollo --password xWF0fzypQShHKnND --authenticationDatabase admin heroku_fvl252wx/

// mongoimport --host erpDevelope-shard-0/erpdevelope-shard-00-00-tfhcs.mongodb.net:27017,erpdevelope-shard-00-01-tfhcs.mongodb.net:27017,erpdevelope-shard-00-02-tfhcs.mongodb.net:27017 --ssl --username desarrollo --password <PASSWORD> --authenticationDatabase admin --db <DATABASE> --collection <COLLECTION> --type <FILETYPE> --file <FILENAME>

