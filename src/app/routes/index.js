const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const RelatorioController = require('../controllers/RelatorioController');
const LoginController = require('../controllers/LoginController');

const router = express.Router();

router.get('/', (req, res) => {
    return res.send("VAI TOMAR NO CU");
});

router.post('/usuarios', UsuarioController.novoUsuario);
// router.get('/usuario', UsuariosController.listarUsuarios);
// router.get('/usuario/:id', UsuariosController.listarUmUsuario);
// router.put('/usuario/:id', UsuariosController.atualizarUsuario);
// router.delete('/usuario/:id', UsuariosController.deletarUsuario);

router.post('/relatorios', LoginController.verifyToken, RelatorioController.novoRelatorio);
// router.get('/relatorios', RelatorioController.listarRelatorio);
// router.get('/relatorios/:id', RelatorioController.listarUmRelatorio);
// router.put('/relatorios/:id', RelatorioController.atualizarRelatorio);
// router.delete('/relatorios/:id', RelatorioController.deletarRelatorio);

router.post('/auth/login', LoginController.login);
router.post('/auth/refresh', LoginController.refreshToken);
router.post('/auth/recuperar-senha', LoginController.recuperarSenha);
router.post('/auth/alterar-senha', LoginController.alterarSenha);

module.exports = router;
