const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const database = require('../../database/connection');

const mailer = require('../../modules/mailer');
const { from, link_recuperar_senha } = require("../../config/mail.json");

class LoginController {
    login(request, response, next){
        const {cpf, senha} = request.body;
        // console.log(cpf, senha);

        database.select('*')
        .table('usuarios')
        .where({cpf})
        .then( data => {
            if (data[0] && bcrypt.compareSync(senha, data[0].senha)){
                const { cpf } = data[0];
                const token = jwt.sign({ cpf }, process.env.SECRET, {
                    expiresIn: 60*60
                });
        
                return response.json({auth: true, token: token, cpf }); 
            }

            else{
				return response.status(401).send({auth: false, message: "Login invalido"});
                // response.send("Error");
            }

        }).catch( error => {
            console.log(error);
            response.status(500).send(error);
        });
    }

    verifyToken(request, response, next){
        const token = request.headers['x-access-token'];
        if(!token){
            return response.status(401).json({auth: false, message: "Acesso não autorizado."});
        }

        else{
            jwt.verify(token, process.env.SECRET, function(err, decoded){
                if(err){
                    return response.status(401).json({auth: false, message: "Acesso não autorizado"});
                }
                else{
                    request.userId = decoded.id;
                    next();
                }
            });
        }
    }
	
	refreshToken(request, response, next){
        const token = request.headers['x-access-token'];
        if(!token){
            return response.status(401).json({auth: false, message: "Acesso não autorizado."});
        }
        else{
            jwt.verify(token, process.env.SECRET, function(err, decoded){
                if(err){
                    return response.status(401).json({auth: false, message: "Acesso não autorizado"});
                }
                else{
                    const { cpf } = decoded;            
					
                    const new_token = jwt.sign({ cpf }, process.env.SECRET, {
                        expiresIn: 60*60
                    });

                    return response.status(200).json({auth: true, token: new_token, cpf});
                }
            });
        }
    }

    recuperarSenha(request, response){
        const { email } = request.body;

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        database.select('*')
        .table('usuarios')
        .where({email})
        .then(data => {
            if(data && data.length > 0){
                mailer.sendMail({
                    to: email,
                    from,
                    subject: 'Recuperação de Senha',
                    html: `<h1>Altere sua Senha</h1><br><p>Olá ${data[0].nome}, recebemos sua solicitação de alteração de senha. Entre no link a seguir para alterar: <a href='${link_recuperar_senha}/${data[0].email}/${token}'>${link_recuperar_senha}/${data[0].email}/${token}</a></p>`,
                }, (err) => {
                    if( err ){
                        console.log(err);
                        return response.status(400).json({ message: "Erro no envio de email.", erro: err });
                    }
                    
                    database.update({senhaResetToken: token, senhaResetExpires: now})
                    .table('usuarios')
                    .where({email})
                    .then( data => {
                        if( data > 0 ){
                            return response.status(200).json('Email enviado');
                        }
                        else{
                            return response.status(404).json( {message : "Email não encontrado."} );
                        }
                    }).catch( error => {
                        console.log("Erro na recuperação de senha: " + error);
                        return response.status(500).json({ message : "Erro interno na recuperação de senha."});
                    });
                })
            }
            else{
                return response.status(404).json( {message : "Email não encontrado."} );
            }
        }).catch( error => {
            console.log("Erro na recuperação de senha: " + error);
            return response.status(500).json({ message : "Erro interno na recuperação de senha."});
        });
    }

    alterarSenha(request, response){
        const { email, token, senha } = request.body;

        const now = new Date();
        
        database.select(['senhaResetToken', 'senhaResetExpires'])
        .table('usuarios')
        .where({email})
        .then(data => {
            if(data && data.length > 0){
                const { senhaResetToken, senhaResetExpires } = data[0]
                console.log(now, senhaResetExpires);
                if(token != senhaResetToken){
                    return response.status(404).json( {message : "Token inválido."} );
                }

                if(now > senhaResetExpires){
                    return response.status(400).json( {message : "Token expirado."} );
                }

                const salt = bcrypt.genSaltSync(10);
                const bcrypt_password = bcrypt.hashSync(senha, salt);

                database.update({senha: bcrypt_password})
                .table('usuarios')
                .where({email, senhaResetToken})
                .then(rows => {
                    if(rows > 0){
                        return response.status(200).json( {message : "Senha alterada com sucesso."} );
                    }
                    else{
                        return response.status(404).json( {message : "Usuário inválido."} );
                    }
                }).catch(error => {
                    return response.status(500).json( {message : "Erro na alteração de senha."} );
                });

            }
            else{
                return response.status(404).json( {message : "Usuário inválido."} );
            }
        }).catch(error => {
            console.log("Falha interna ao interar senha: " + error);
            return response.status(500).json( {message : "Falha interna ao interar senha."} );
        });
    }

    isAdmin(request, response, next){
        const id = request.userId;
        database.select('isadmin')
        .table('usuarios')
        .where({id: id})
        .then( data => {
            if (data[0] && data[0].isadmin == 1){
                next();
            }
            else{
                return response.status(401).json({auth: false, message: "Acesso não autorizado"});
            }
        }).catch(error => {
            return response.status(500).json({auth: false, message: "Erro na autorização de usuário."});
        });
    }
}

module.exports = new LoginController();