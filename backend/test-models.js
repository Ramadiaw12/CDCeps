import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY non définie');
    process.exit(1);
}

console.log('🔍 Test des modèles Gemini disponibles...\n');

const models = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-pro-exp',
    'gemini-2.0-flash-lite-preview'
];

for (const model of models) {
    try {
        console.log(`📌 Test de ${model}...`);
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Dis bonjour" }] }]
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
            console.log(`✅ ${model} FONCTIONNE ! Réponse: ${text}\n`);
        } else {
            const error = await response.json();
            console.log(`❌ ${model} non disponible: ${error.error?.message || response.statusText}\n`);
        }
    } catch (error) {
        console.error(`❌ Erreur avec ${model}: ${error.message}\n`);
    }
}
