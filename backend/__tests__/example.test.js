// __tests__/example.test.js
// Este archivo es solo para verificar que Jest funciona correctamente.
// Puedes eliminarlo cuando empieces a escribir tests reales.

describe('Ejemplo - Jest funciona', () => {
  test('2 + 2 debería ser 4', () => {
    expect(2 + 2).toBe(4);
  });

  test('una cadena debería contener texto', () => {
    expect('The Destiny Vault').toContain('Destiny');
  });
});
