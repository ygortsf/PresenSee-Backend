const router = require('express').Router();
const ctrl = require('../controllers/alertaController');
const { autenticar } = require('../middlewares/auth');

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/nao-lidos', ctrl.contarNaoLidos);
router.put('/:id/lido', ctrl.marcarLido);
router.put('/:id/resolver', ctrl.resolver);

module.exports = router;
