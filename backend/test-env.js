import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📂 Chargement du .env...\n');

// Méthode 1: Chargement standard
dotenv.config();
console.log('Méthode 1 - DB_USER:', process.env.DB_USER || '❌ non défini');

// Méthode 2: Avec chemin absolu
const envPath = path.resolve(__dirname, '.env');
console.log('Chemin du .env:', envPath);

const result = dotenv.config({ path: envPath });
console.log('Méthode 2 - DB_USER:', process.env.DB_USER || '❌ non défini');

// Afficher toutes les variables DB
console.log('\n🔍 Toutes les variables DB:');
console.log('  DB_HOST:', process.env.DB_HOST || '❌');
console.log('  DB_PORT:', process.env.DB_PORT || '❌');
console.log('  DB_USER:', process.env.DB_USER || '❌');
console.log('  DB_NAME:', process.env.DB_NAME || '❌');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ défini (masqué)' : '❌ MANQUANT');
console.log('  DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

// Vérifier le fichier .env
if (fs.existsSync(envPath)) {
    console.log('\n✅ Fichier .env trouvé');
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log('\n📄 Contenu du .env:');
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join('=');
                if (key.toLowerCase().includes('password')) {
                    value = '********';
                }
                console.log(`   ${key}=${value}`);
            }
        }
    });
} else {
    console.error('\n❌ Fichier .env NON TROUVÉ à', envPath);
}
