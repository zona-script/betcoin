module.exports = {
    api: {
        host: 'api.betcoin.tm',
        port: '443',
        protocol: 'https',
        base: "keno"
    },
    socket: {
        host: 'api.betcoin.tm',
        port: '8443',
        protocol: 'https',
        base: "keno"
    },
    playerServer: {
        host: 'api.betcoin.tm',
        port: 443,
        protocol: 'https',
        base: "account"
    },
    cacheServer: {
        host: 'api.betcoin.tm',
        endpoint: '/counter/statistics/global/latest',
        event: 'global counter'
    }
};
