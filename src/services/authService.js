// Regra básica de validação de formulário de login

function validarCamposLogin(email, senha) {
    if (!email || !senha) {
        throw new Error("E-mail e senha são obrigatórios");
    }
    if (!email.includes('@')) {
        throw new Error("E-mail inválido");
    }
    return true;
}

module.exports = { 
    validarCamposLogin 
};