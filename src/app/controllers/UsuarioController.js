const database = require('../../database/connection');
const bcrypt = require('bcrypt');

class UsuarioController {
    novoUsuario(request, response){
        const {nome, email, telefone, empresa, cpf, senha} = request.body;

        const salt = bcrypt.genSaltSync(10);
        const bcrypt_password = bcrypt.hashSync(senha, salt);

        database.insert({nome, email, telefone, empresa, cpf, senha: bcrypt_password})
        .table('usuarios')
        .then(data => {
            response.json({
                message:"Usuario criado com sucesso!",
                id: data[0]
            });
        }).catch(error => {
            if(error.code == 'ER_DUP_ENTRY')
                response.status(409).json(error);
            else
                response.status(500).json({message: "Falha interna na criação de usuário.", error});
        });
    }

    listarUsuario(request, response){
        database.select(['id', 'nome', 'email', 'nascimento', 'telefone', 'username'])
        .table('usuarios')
        .then(data => {
            response.json(data);
        }).catch(error => {
            console.log(error);
            response.status(500).json({})
        });
    }

    listarUmUsuario(request, response){
        const id = request.params.id;

        database.select('*')
        .table('usuarios')
        .where({id: id})
        .then(data => {
            if(data[0]){
                response.json(data[0]);
            }
            else{
                response.status(404).json({
                    message: "Usuario não encontrado"
                })
            }
        }).catch(error => {
            console.log(error);
            response.status(500).json({
                message: "Erro na leitura de usuarios."
            })
        });
    }

    atualizarUsuario(request, response){
        const id = request.params.id;
        const body = request.body;

        database.update(body)
        .table('usuarios')
        .where({id: id})
        .then(data => { 
            if(data != 0){
                response.json({message: "Usuario atualizado com sucesso."});
            }
            else{
                response.status(404).json({message: "Usuario não encontrado"});
            }
            
        }).catch(error => {
            response.status(500).json({
                message: "Erro na atualização de usuarios."
            });
        });
    }

    deletarUsuario(request, response){
        const id = request.params.id;

        database.delete()
        .table('usuarios')
        .where({id: id})
        .then(data => {
            if(data != 0){
                response.json({message: "Usuário deletado com sucesso."});
            }
            else{
                response.status(404).json({message: "Usuario não encontrado"});
            }            
        }).catch(error => {
            response.status(500).json({
                message: "Erro na exclusão de usuarios."
            });
        });
    }
}

module.exports = new UsuarioController();
