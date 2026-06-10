const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { autenticar } = require('../middlewares/auth');

router.use(autenticar);

router.get('/resumo', ctrl.resumoGeral);
router.get('/evolucao-mensal', ctrl.evolucaoMensal);
router.get('/frequencia-por-turma', ctrl.frequenciaPorTurma);
router.get('/relatorio-mensal', ctrl.relatorioMensal);

module.exports = router;
