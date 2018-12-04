(function(window, angular) {
    'use strict';
    var bcAdmin = angular.module('bcAdmin', ['ng', 'ivpusic.cookie', 'base64']);

    var cookieOptions = {
        path: '/'
    };


    bcAdmin.provider('BCAuth', function() {
        var hostname = "localhost";
        var port = 8443;
        var scheme = "https";
        var base = "";
        var cookieName = 'api-token';
        var publicPaths = [];

        var constructUrl = function() {
            var urlString = scheme + "://" + hostname + ":" + port;
            if (base.length) {
                urlString += "/" + base.replace((/^\//), "");
            }
            return urlString;
        };

        this.serverConfig = function(conf) {
            hostname = conf.hostname || hostname;
            port = conf.port || port;
            scheme = conf.scheme || scheme;
            base = conf.base || base;
        };

        this.cookieName = function(newName) {
            cookieName = newName;
        };

        this.publicPaths = function(paths) {
            publicPaths = paths;
        };

        this.$get = [
            '$http',
            '$base64',
            '$location',
            'ipCookie',
            '$resource',
            'BCAdminSession',
            function($http, $base64, $location, ipCookie, $resource, BCAdminSession) {
                BCAdminSession.cookieName = cookieName;
                BCAdminSession.token = ipCookie(BCAdminSession.cookieName);
                var resourceUrl = constructUrl();
                return {
                    publicPaths: publicPaths,
                    url: constructUrl(),
                    resourceUrl: constructUrl(),
                    login: function(username, password, oneTimePass) {
                        var loginUrl = this.url + '/admin/auth';
                        if(oneTimePass){
                            loginUrl += '?one_time_pass=' + oneTimePass;
                        }
                        return $http.get(loginUrl, {
                            headers: {
                                Authorization: 'Basic ' + $base64.encode(username + ":" + password)
                            }
                        });
                    },
                    logout: function() {
                        $http.get(this.url + '/logout').success(function() {
                            ipCookie.remove(BCAdminSession.cookieName);
                        });
                    },
                    isPublic: function(path) {
                        path = '/' + path.split('/')[1];
                        if (this.publicPaths.indexOf(path) >= 0) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    verifyToken: function() {
                        var loginUrl = this.url + '/admin/token';
                        return $http.get(loginUrl, {
                            headers: {
                                Authorization: 'Bearer ' + BCAdminSession.token
                            }
                        }).success(function(data) {
                            BCAdminSession.user = data;
                        }).error(function(error) {
                            console.error("backoffice token failed:", error);
                            BCAdminSession.token = null;
                            $location.path('/login');
                        });
                    },
                    Admin: $resource(resourceUrl + "/admin/:action/:target/:targetAction/:range", {},{
                        getAdmin: {
                            method: 'GET'
                        },
                        getTotpSecret: {
                            method: 'GET',
                            params: {
                                action: 'totp'
                            }
                        },
                        activateTotp: {
                            method: 'PUT',
                            params: {
                                action: 'totp',
                                oneTimePass: '@oneTimePass'
                            }
                        },
                        deactivateTotp: {
                            method: 'DELETE',
                            params: {
                                action: 'totp'
                            }
                        }
                    })
                };
            }];
    });

    bcAdmin.value('BCAdminSession', {
        token: null,
        user: null,
        cookieName: null
    });

    bcAdmin.run([
        '$rootScope',
        'ipCookie',
        'BCAdminSession',
        'BCAuth',
        function($rootScope, ipCookie, BCAdminSession, BCAuth) {
            // if a token exists when this is run, tru subscribing to the socket viw token
            BCAdminSession.token = ipCookie(BCAdminSession.cookieName);
            BCAuth.verifyToken();
            $rootScope.BCAdminSession = BCAdminSession;
        }
    ]);


    bcAdmin.config(['$httpProvider', function($httpProvider) {
        var interceptor = function($q, ipCookie, $location, BCAdminSession) {
            BCAdminSession.token = ipCookie(BCAdminSession.cookieName);
            return {
                'request': function(config) {
                    if (BCAdminSession.token && config.headers.Authorization === undefined) {
                        config.headers.Authorization = "Bearer " + BCAdminSession.token;
                    }
                    return config || $q.when(config);
                },
                'response': function(response) {
                    var token = response.headers('api-token');
                    if (token) {
                        BCAdminSession.token = token;
                        ipCookie(BCAdminSession.cookieName, token, cookieOptions);
                    }
                    return response || $q.when(response);
                },
                'responseError': function(rejection) {
                    if (rejection.status === 403) {
                        BCAdminSession.token = null;
                        ipCookie.remove(BCAdminSession.cookieName);
                        $location.path('/login');
                    } else if (rejection.status === 417) {
                        $location.path('/security');
                    }
                    return $q.reject(rejection);
                }
            };
        };
        $httpProvider.interceptors.push(['$q', 'ipCookie', '$location', 'BCAdminSession', interceptor]);
    }]);

    return bcAdmin;
})(window, window.angular);
