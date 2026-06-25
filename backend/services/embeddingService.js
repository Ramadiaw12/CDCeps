import { pipeline } from '@xenova/transformers';

let extractor = null;

async function getExtractor() {
    if (!extractor) {
        console.log('📥 Chargement du modèle BGE-M3...');

        extractor = await pipeline(
            'feature-extraction',
            'Xenova/bge-m3'
        );

        console.log('✅ Modèle chargé');
    }

    return extractor;
}

export async function genererEmbedding(text) {
    try {
        const model = await getExtractor();

        const output = await model(text, {
            pooling: 'mean',
            normalize: true
        });

        return Array.from(output.data);

    } catch (error) {
        console.error(
            'Erreur génération embedding :',
            error.message
        );

        return null;
    }
}