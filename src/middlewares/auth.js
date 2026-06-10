const jwt = require('jsonwebtoken');
const { User } = require('../models');

const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user || !user.ativo) {
      return res.status(401).json({ erro: 'Usuário inválido ou inativo.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

const autorizar = (...perfis) => {
  return (req, res, next) => {
    if (!perfis.includes(req.user.perfil)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este perfil.' });
    }
    next();
  };
};

module.exports = { autenticar, autorizar };
