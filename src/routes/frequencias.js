const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/frequenciaController');
const { autenticar } = require('../middlewares/auth');

router.use(autenticar);

router.get('/', ctrl.buscarChamada);

router.post('/chamada',
  [
    body('turmaId').notEmpty().withMessage('Turma obrigatória.'),
    body('data').isDate().withMessage('Data inválida.'),
    body('registros').isArray({ min: 1 }).withMessage('Registros de presença obrigatórios.'),
  ],
  ctrl.registrarChamada
);

router.put('/:id/justificar', ctrl.justificarFalta);

module.exports = router;
