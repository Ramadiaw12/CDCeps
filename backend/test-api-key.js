import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Vérification des clés API:');
console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Définie' : '❌ Non définie');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Définie' : '❌ Non définie');

// Test Gemini si disponible
if (process.env.GEMINI_API_KEY) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Dis bonjour en 1 mot" }] }]
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Gemini API fonctionne!');
            console.log('   Réponse:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        } else {
            console.log('❌ Erreur Gemini API:', response.status, response.statusText);
            const error = await response.text();
            console.log('   Détail:', error);
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}
