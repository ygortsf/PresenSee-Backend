require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const app = express();

// Segurança e middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // limite maior para biometria base64
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use('/api/', limiter);

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/alunos', require('./routes/alunos'));
app.use('/api/turmas', require('./routes/turmas'));
app.use('/api/frequencias', require('./routes/frequencias'));
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor.', detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Banco de dados conectado.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Modelos sincronizados.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📌 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

iniciar();
