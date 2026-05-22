const isAdmin = (u) => u?.rol?.nombre === 'admin';
const isGerente = (u) => u?.rol?.nombre === 'gerente';
const isStaff = (u) => isAdmin(u) || isGerente(u);
const isCliente = (u) => u?.rol?.nombre === 'Cliente' || u?.rol?.nombre === 'cliente';
module.exports = { isAdmin, isGerente, isStaff, isCliente };
