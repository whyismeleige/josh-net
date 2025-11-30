require("dotenv").config();
const puppeteer = require("puppeteer");
const { MongoClient } = require("mongodb");
const dbConnect = require("../../database/connectDB");

const User = require("../../models/savedUser.model");

const SCRAPING_URL = "https://sjchyd.in/StudentLogin";

const getStudentIds = async () => {
  const agg = [
    {
      $group: {
        _id: "$academic.studentId",
      },
    },
  ];

  const client = await MongoClient.connect(process.env.MONGO_URI);

  const coll = client.db("college_database").collection("users");
  const cursor = coll.aggregate(agg);
  const result = await cursor.toArray();
  await client.close();

  return result;
};

dbConnect();

const getStudentsData = async () => {
  console.log("Scraping Data from College");

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const tickets = await getStudentIds();

  const page = await browser.newPage();
  await page.goto(SCRAPING_URL, {
    waitUntil: "networkidle2",
  });

  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  for (let ticket of tickets) {
    await page.waitForSelector("input");
    await page.$eval(
      "input[type='text']",
      (el, value) => (el.value = value),
      String(ticket._id)
    );
    await page.locator("#btnGo").click();
    await new Promise((r) => setTimeout(r, 2000));

    if (page.url() === `${SCRAPING_URL}/StudentLandingPage`) {
      await page.locator("a").click();
      await page.waitForSelector(".caption");
      const studentData = await page.$$eval(".caption > p", (options) => {
        return options.map((option) =>
          option.textContent !== "Home" ? option.textContent.trim() : null
        );
      });
      console.log(studentData);
      studentData.pop();

      await page.waitForSelector("#attendance-tab");
      await page.waitForFunction(() => {
        return typeof $ !== "undefined" && typeof $.fn.tab === "function";
      });

      await page.evaluate(() => {
        $("#attendance-tab").tab("show");
      });

      const attendanceData = await page.evaluate(() => {
        const rows = document.querySelectorAll("table tbody tr");
        const data = [];
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 5) {
            data.push({
              subject: cells[0].innerText.trim(),
              workingDays: parseInt(cells[1].innerText.trim()) || 0,
              daysPresent: parseInt(cells[2].innerText.trim()) || 0,
              daysAbsent: parseInt(cells[3].innerText.trim()) || 0,
              percentage: parseFloat(cells[4].innerText.trim()) || 0,
            });
          }
        });
        return data;
      });

      await page.waitForSelector("#marks-tab");
      await page.waitForFunction(() => {
        return typeof $ !== "undefined" && typeof $.fn.tab === "function";
      });

      await page.evaluate(() => {
        $("#marks-tab").tab("show");
      });

      const marksData = await page.evaluate(() => {
        const rows = document.querySelectorAll("table tbody tr");
        const data = [];
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 7) {
            data.push({
              subject: cells[0].innerText.trim(),
              cia1: parseInt(cells[1].innerText.trim()) || 0,
              cia2: parseInt(cells[2].innerText.trim()) || 0,
              cia3: parseInt(cells[3].innerText.trim()) || 0,
              average: parseInt(cells[4].innerText.trim()) || 0,
              sbt: parseInt(cells[5].innerText.trim()) || 0,
              total: parseInt(cells[6].innerText.trim()) || 0,
            });
          }
        });
        return data;
      });

      const newUserData = {
        studentId: studentData[0],
        name: studentData[1],
        course: studentData[2],
        phone: studentData[3],
        attendance: attendanceData,
        marks: marksData,
      };

      const newUser = new User(newUserData);

      newUser
        .save()
        .then(() => console.log("New User Saved Id", studentData[0]))
        .catch((error) =>
          console.error(`Error in Saving HallTicket: ${studentData[0]}`, error)
        );
    }

    await page.goto(SCRAPING_URL, {
      waitUntil: "networkidle2",
    });
  }
};

getStudentsData();
