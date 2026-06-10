const { body } = require('express-validator');
const router = require('express').Router();
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');

router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').notEmpty().withMessage('Senha obrigatória.'),
  ],
  authController.login
);

router.post('/cadastrar',
  [
    body('nome').notEmpty().withMessage('Nome obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
    body('perfil').isIn(['professor', 'coordenador', 'secretaria', 'gestor']).withMessage('Perfil inválido.'),
  ],
  authController.cadastrar
);

router.get('/perfil', autenticar, authController.perfil);
router.put('/alterar-senha', autenticar, authController.alterarSenha);

module.exports = router;
