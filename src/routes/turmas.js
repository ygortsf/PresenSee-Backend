// turmas.js
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/turmaController');
const { autenticar, autorizar } = require('../middlewares/auth');

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);

router.post('/',
  autorizar('coordenador', 'gestor', 'secretaria'),
  [
    body('nome').notEmpty().withMessage('Nome da turma obrigatório.'),
    body('serie').notEmpty().withMessage('Série obrigatória.'),
    body('turno').isIn(['manha', 'tarde', 'noite']).withMessage('Turno inválido.'),
  ],
  ctrl.criar
);

router.put('/:id', autorizar('coordenador', 'gestor', 'secretaria'), ctrl.atualizar);
router.delete('/:id', autorizar('coordenador', 'gestor'), ctrl.desativar);

module.exports = router;
