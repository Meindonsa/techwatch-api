export const openApiDoc = {
    openapi: '3.0.0',
    info: {
        title: 'RSS Reader API',
        version: '1.0.0',
        description: 'API légère de lecture de flux RSS/Atom',
    },
    components: {
        securitySchemes: {
            BearerAuth: { type: 'http', scheme: 'bearer' },
        },
    },
    security: [{ BearerAuth: [] }],
    paths: {
        '/detect': {
            post: {
                summary: "Détecter le flux RSS/Atom d'un site",
                description: "Vérifie si un site possède un flux RSS, Atom ou autre et retourne son URL.",
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'string', example: 'dev.to' } } },
                },
                responses: {
                    200: {
                        description: 'Flux détecté',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['rss', 'atom', 'none'] },
                                        feedUrl: { type: 'string', nullable: true },
                                        detectionMethod: { type: 'string' },
                                        originalUrl: { type: 'string' },
                                        fromCache: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: 'Token manquant ou invalide' },
                    404: { description: 'Aucun flux trouvé' },
                    429: { description: 'Trop de requêtes' },
                },
            },
        },
        '/article': {
            post: {
                summary: "Récupérer les articles d'un flux",
                description: "Retourne tous les articles d'un flux RSS ou Atom, triés par date décroissante.",
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'string', example: 'https://dev.to/feed' } } },
                },
                responses: {
                    200: {
                        description: 'Articles récupérés',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        feedUrl: { type: 'string' },
                                        title: { type: 'string' },
                                        articles: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    title: { type: 'string' },
                                                    link: { type: 'string' },
                                                    date: { type: 'string', nullable: true },
                                                    summary: { type: 'string', nullable: true },
                                                    author: { type: 'string', nullable: true },
                                                    image: { type: 'string', nullable: true },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: 'Token manquant ou invalide' },
                    422: { description: 'Flux invalide ou inaccessible' },
                    429: { description: 'Trop de requêtes' },
                },
            },
        },
        '/articles': {
            post: {
                summary: 'Récupérer les articles de plusieurs flux',
                description: 'Retourne les articles de plusieurs flux en une seule requête. Maximum 10 URLs.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['https://dev.to/feed', 'https://blog.nasa.gov/feed/'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Articles récupérés',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'number' },
                                        feeds: { type: 'array', items: { type: 'object' } },
                                        failed: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    feedUrl: { type: 'string' },
                                                    error: { type: 'string' },
                                                    code: { type: 'string' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: 'Body invalide' },
                    401: { description: 'Token manquant ou invalide' },
                    429: { description: 'Trop de requêtes' },
                },
            },
        },
    },
}