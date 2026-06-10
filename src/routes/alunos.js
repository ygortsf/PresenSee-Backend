const { body } = require('express-validator');
const router = require('express').Router();
const ctrl = require('../controllers/alunoController');
const { autenticar, autorizar } = require('../middlewares/auth');

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.get('/:id/frequencia', ctrl.frequenciaDoAluno);

router.post('/',
  autorizar('coordenador', 'secretaria', 'gestor'),
  [
    body('matricula').notEmpty().withMessage('Matrícula obrigatória.'),
    body('nome').notEmpty().withMessage('Nome obrigatório.'),
    body('turmaId').notEmpty().withMessage('Turma obrigatória.'),
  ],
  ctrl.criar
);

router.put('/:id', autorizar('coordenador', 'secretaria', 'gestor'), ctrl.atualizar);
router.delete('/:id', autorizar('coordenador', 'gestor'), ctrl.desativar);
router.post('/:id/biometria', ctrl.cadastrarBiometria);

module.exports = router;
