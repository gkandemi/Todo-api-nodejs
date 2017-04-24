
// Şifrelemek için kullanilacak olan module
var bcrypt = require('bcrypt');
var _ = require("underscore");

var cryptojs = require("crypto-js");
var jwt = require("jsonwebtoken");

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define("user", {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
            hooks: {
                beforeValidate: function (user, option) {
                    if (typeof user.email === "string") {
                        user.email = user.email.toLowerCase();
                    }
                }
            },
            classMethods: {
                authenticate: function (body) {
                    return new Promise(function (resolve, reject) {

                        if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                            // Bad Request
                            // return res.status(400).send();
                            return reject();
                        }

                        user.findOne({
                            where: {
                                email: body.email
                            }
                        }).then(function (user) {
                            if (!user || !bcrypt.compareSync(body.password, user.get("password_hash"))) {
                                // route var fakat auth. olamadi...
                                // return res.status(401).send();
                                return reject();
                            }

                            // res.json(user.toPublicJSON());
                            resolve(user);

                        }, function () {
                            // Internal Server Error
                            // res.status(500).send();
                            reject();
                        })


                    })
                },
                findByToken: function (token) {
                    return new Promise(function (resolve, reject) {

                        try {

                            // JWT den token in geri cevrilmesi...
                            var decodedJWT = jwt.verify(token, "qwerty098");
                            var bytes = cryptojs.AES.decrypt(decodedJWT.token, "abs!@#!");
                            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                            // tokenData icerisinde 2 tane attribute saklamaktadir.
                            // id
                            // type
                            // id den yola cikarak veri tabanından user elde edebiliriz.

                            user.findById(tokenData.id).then(function (user) {
                                if (user) {
                                    resolve(user);
                                } else {
                                    reject();
                                }
                            }, function () {
                                reject();
                            })

                        } catch (e) {
                            reject();
                        }

                    })
                }
            },
            instanceMethods: {
                toPublicJSON: function () {
                    var json = this.toJSON();
                    return _.pick(json, "id", "email", "createdAt", "updatedAt");
                },
                generateToken: function (type) {
                    if (!_.isString(type)) {
                        return undefined;
                    }

                    try {
                        var stringData = JSON.stringify({ id: this.get("id"), type: type });
                        var encryptedData = cryptojs.AES.encrypt(stringData, "abs!@#!").toString();
                        var token = jwt.sign({
                            token: encryptedData,
                        }, "qwerty098");

                        return token;
                    } catch (e) {
                        console.error(e);
                        return undefined;
                    }
                }
            }
        });

    return user;
}