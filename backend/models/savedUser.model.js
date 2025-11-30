const mongoose = require("mongoose");

const saveUserSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  course: String,
  phone: String,
  attendance: [
    {
      subject: String,
      workingDays: Number,
      daysPresent: Number,
      daysAbsent: Number,
      percentage: Number,
    },
  ],
  marks: [
    {
      subject: String,
      cia1: Number,
      cia2: Number,
      cia3: Number,
      average: Number,
      sbt: Number,
      total: Number,
    },
  ],
});

module.exports = mongoose.model("Saveuser", saveUserSchema);
