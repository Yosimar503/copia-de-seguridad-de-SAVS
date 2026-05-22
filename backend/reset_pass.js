const bcrypt = require('bcrypt');
const { Usuario } = require('./models');

async function resetPassword() {
    try {
        const email = 'yosimarvv@gmail.com';
        const newPassword = 'yosi12345.';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const [updated] = await Usuario.update(
            { password: hashedPassword },
            { where: { email: email } }
        );
        
        if (updated) {
            console.log(`✅ Contraseña reseteada con éxito para ${email}`);
            console.log(`🔑 Nueva contraseña: ${newPassword}`);
        } else {
            console.log(`❌ No se encontró al usuario con email ${email}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetPassword();
