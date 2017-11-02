module.exports = function(sequelize, DataTypes) {
  let courses = sequelize.define("Courses", {
    instructor: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    time: DataTypes.STRING
  });
  return courses;
};
