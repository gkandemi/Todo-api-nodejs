module.exports = function (sequelize, DataTypes){
    return sequelize.define('todo', {
            description : {
                type : DataTypes.STRING,
                allowNull : false, // bos birakilmamalidir..
                validate : {
                    len : [1, 250] // karakter sayisi 1-250 arasında olmalıdır..
                }
            },
            completed : {
                type : DataTypes.BOOLEAN,
                allowNull : false, // bos birakilmamalidir..
                defaultValue : false // eger deger girilmezse false olarak belirle..
            }
    });
}