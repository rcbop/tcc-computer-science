module.exports = {
    name: 'API',
    version: '1.0',
    env: process.env.NODE_ENV || 'development',
    port: process.env.HTTP_PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    db: {
        uri: 'mongodb://' + process.env.MONGODB_HOST || 'mongodb://127.0.0.1:27017/api',
    },
};