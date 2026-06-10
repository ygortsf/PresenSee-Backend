const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

const gerarToken = (user) => {
  return jwt.sign(
    { id: user.id, perfil: user.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const login = async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email, ativo: true } });

    if (!user || !(await user.verificarSenha(senha))) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    const token = gerarToken(user);
    res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const cadastrar = async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  try {
    const { nome, email, senha, perfil } = req.body;

    const existente = await User.findOne({ where: { email } });
    if (existente) return res.status(409).json({ erro: 'Email já cadastrado.' });

    const user = await User.create({ nome, email, senha, perfil });
    const token = gerarToken(user);

    res.status(201).json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

const perfil = async (req, res) => {
  res.json({
    id: req.user.id,
    nome: req.user.nome,
    email: req.user.email,
    perfil: req.user.perfil,
  });
};

const alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!(await user.verificarSenha(senhaAtual))) {
      return res.status(400).json({ erro: 'Senha atual incorreta.' });
    }

    user.senha = novaSenha;
    await user.save();
    res.json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { login, cadastrar, perfil, alterarSenha };
