const formatUser = (u) => {
  if (!u) return null;
  const j = u.toJSON ? u.toJSON() : { ...u };
  delete j.password;
  j.rol = j.rol?.nombre || j.rol || 'Cliente';
  return j;
};
module.exports = { formatUser };
