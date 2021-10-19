// var knex = require('knex')({
//     client: 'mysql2',
//     connection: {
//         host        : 'localhost',
//         user        : 'root',
//         password    : '',
//         database    : 'sicgesp'
//     }
// });

var knex = require('knex')({
    client: 'mysql2',
    connection: {
        host        : '187.45.179.106',
        user        : 'segov_sicgesp',
        password    : '=hXUuE%*l5gW',
        database    : 'segov_sicgesp'
    }
});

module.exports = knex;