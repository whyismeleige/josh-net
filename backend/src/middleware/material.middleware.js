exports.validateStudentCourse = async (req, res, next) => {
  const { academic, isClassRepresentative } = req.user;
  const { course, year } = req.body.data;

  if (!course || !year) {
    return res.status(400).send({
      message: "Academic Details Required",
      type: "error",
    });
  }

  if (academic.course !== course || academic.course !== year) {
    return res.status(400).send({
      message: "Not Authorized to Upload",
      type: "error",
    });
  }

  if (isClassRepresentative) {
    req.body.data.status = "published";
  }

  next();
};
