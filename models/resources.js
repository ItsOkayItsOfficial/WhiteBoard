module.exports = function(sequelize, DataTypes) {
  let resources = sequelize.define("Resources", {
    resource_url: DataTypes.STRING,
    resource_desc: DataTypes.STRING
  });

  resources.associate = function(models) {
    resources.belongsTo(models.Sessions);
    resources.belongsTo(models.Users);
  }
  
  return resources;
};