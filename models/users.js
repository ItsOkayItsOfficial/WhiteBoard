module.exports = function(sequelize, DataTypes) {
  let users = sequelize.define("Users", {
    user_name: DataTypes.STRING,
    user_email: DataTypes.STRING,
    user_login: DataTypes.STRING,
    user_desc: DataTypes.STRING,
    user_avatar: DataTypes.STRING
  });
  return users;
};
