module.exports = function(sequelize, DataTypes) {
  let users = sequelize.define("Users", {
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
  });
  return users;
};
