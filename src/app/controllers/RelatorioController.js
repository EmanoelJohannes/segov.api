const database = require('../../database/connection');

class RelatorioController {
    novoRelatorio(request, response){
        const {cpf, estado, municipio, status, arquivo, erros} = request.body;

        database.insert({cpf, estado, municipio, status, arquivo, erros: JSON.stringify(erros)})
        .table('relatorios')
        .then(data => {
            response.json({
                message:"Relatorio criado com sucesso!",
                id: data[0],
                erros
            });
        }).catch(error => {
            if(error.code == 'ER_DUP_ENTRY')
                response.status(409).json(error);
            else
                response.status(500).json({message: "Falha interna na criação de usuário."});
        });
    }

    listarRelatorio(request, response){
        database.select('*')
        .table('relatorios')
        .then(data => {
            data.forEach(element => {
                element.erros = JSON.parse(element.erros);
            });

            response.json(data);
        }).catch(error => {
            console.log(error);
            response.status(500).json({})
        });
    }

    listarUmRelatorio(request, response){
        const id = request.params.id;

        database.select('*')
        .table('relatorios')
        .where({id: id})
        .then(data => {
            if(data[0]){
                data[0].erros = JSON.parse(data[0].erros)
                response.json(data[0]);
            }
            else{
                response.status(404).json({
                    message: "Relatorio não encontrado"
                })
            }
        }).catch(error => {
            console.log(error);
            response.status(500).json({
                message: "Erro na leitura de Relatorios."
            })
        });
    }

    atualizarRelatorio(request, response){
        const id = request.params.id;
        const body = request.body;

        if(body.erros){
            body.erros = JSON.stringify(body.erros);
        }

        database.update(body)
        .table('relatorios')
        .where({id: id})
        .then(data => { 
            if(data != 0){
                response.json({message: "Relatorio atualizado com sucesso."});
            }
            else{
                response.status(404).json({message: "Relatorio não encontrado"});
            }
            
        }).catch(error => {
            response.status(500).json({
                message: "Erro na atualização de Relatorios."
            });
        });
    }

    deletarRelatorio(request, response){
        const id = request.params.id;

        database.delete()
        .table('relatorios')
        .where({id: id})
        .then(data => {
            if(data != 0){
                response.json({message: "Usuário deletado com sucesso."});
            }
            else{
                response.status(404).json({message: "Relatorio não encontrado"});
            }            
        }).catch(error => {
            response.status(500).json({
                message: "Erro na exclusão de Relatorios."
            });
        });
    }
}

module.exports = new RelatorioController();
