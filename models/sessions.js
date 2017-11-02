module.exports = function(sequelize, DataTypes) {
  let sessions = sequelize.define("Sessions", {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    time: DataTypes.INTEGER,
    duration: DataTypes.INTEGER
  });
  return sessions;
};

