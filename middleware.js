var cryptojs = require("crypto-js");

module.exports = function (db) {
    return {
        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth') || '';

            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function (tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }

                // request içerisinde token isimli bir attribute olsutur ve tokenInstance' ı buna aktar..
                req.token = tokenInstance;
                // user instance bulmak için token kullanarak user tablosuna sorgu gonder..
                return db.user.findByToken(token);

            }).then(function (user) {
                req.user = user;
                next();
            }).catch(function () {
                res.status(401).send();
            })
        }
    };
};