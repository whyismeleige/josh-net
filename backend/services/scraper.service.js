/**
 * Reverse Engineering entire sjchyd.in and josephscollege.ac.in because its data and apis are useful for our projects.
 *
 * You can check out the Bruno API Collection to better understand the API Requests and Responses.
 *
 * Well the primary stuff is that we have Two Major Modules,
 *   1 - Student Login Sub-Pages
 *   2 - Faculty Login Sub-Pages
 *
 * Student Login Sub-Pages contain external marks data and all that essential for us.
 * Faculty Login Sub-Pages contain viable info for all the students which is important for JOSH-Net.
 */

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { HttpsProxyAgent } = require("https-proxy-agent");

/**
 * Base Scraper will change in the future for now.
 *
 * Essential Tasks, is to intiate the session id and rotate the userAgents and act like an actual user.
 *
 * The Session ID is key, so on the first launch of the website we get the session id through which we can access the APIs.
 *
 */

class BaseScraper {
  constructor(options = {}) {
    this._baseURL = "https://sjchyd.in";
    this._sessionCookie = null;
    this._useProxy = options.proxy || null;
    this._rotateUserAgents = options.rotateUserAgents !== false;
    this._delay = options.delay || 2000; // Default 2 second delay between requests

    // Pool of realistic user agents
    this._userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
    ];

    this._client = this._createClient();
  }

  _createClient() {
    const config = {
      baseURL: this._baseURL,
      headers: {
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        DNT: "1",
        "Upgrade-Insecure-Requests": "1",
      },
    };

    if (this._useProxy) {
      config.httpsAgent = new HttpsProxyAgent(this._useProxy);
      config.proxy = false;
    }

    return axios.create(config);
  }

  _getRandomUserAgent() {
    return this._userAgents[
      Math.floor(Math.random() * this._userAgents.length)
    ];
  }

  async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async _makeRequest(config) {
    if (this._rotateUserAgents) {
      config.headers = {
        ...config.headers,
        "User-Agent": this._getRandomUserAgent(),
      };
    }

    await this._sleep(this._delay + Math.random() * 1000);

    return await this._client(config);
  }

  async _getSessionCookie() {
    try {
      console.log("Getting Session Cookie....");
      const response = await this._makeRequest({
        method: "GET",
        url: "/",
      });

      const cookies = response.headers["set-cookie"];

      if (cookies) {
        const sessionCookie = cookies.find((c) =>
          c.includes("ASP.NET_SessionId")
        );
        if (sessionCookie) {
          this._sessionCookie = sessionCookie.split(";")[0];
          console.log("Session cookie obtained", this._sessionCookie);
          return true;
        }
      }

      throw new Error("Failed to get session cookie");
    } catch (error) {
      console.error("Error getting session", error.message);
      return false;
    }
  }
}

class StudentScraper extends BaseScraper {
  constructor(options = {}) {
    super(options);
  }

  async #validateHallTicket(hallTicketNo) {
    try {
      console.log("Validating Hall Ticket", hallTicketNo);
      const response = await this._makeRequest({
        method: "GET",
        url: "/StudentLogin/ValidateHallticketOld",
        params: {
          hallTicketNo: hallTicketNo,
          reportType: "",
        },
        headers: {
          Cookie: this._sessionCookie,
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${this._baseURL}/StudentLogin`,
          Accept: "*/*",
        },
      });

      const data = response.data;

      if (data.result === -1) {
        console.error("Hall Ticket does not exist");
        return null;
      }

      console.log("Validation Successful");

      return data;
    } catch (error) {
      console.error("Error validating hall ticket", error.message);
      return null;
    }
  }

  async #getStudentProfile() {
    try {
      console.log("\nFetching student profile...");
      const response = await this._makeRequest({
        method: "GET",
        url: "/StudentLogin/StudentCentricView",
        headers: {
          Cookie: this._sessionCookie,
          Referer: `${this._baseURL}/StudentLogin/StudentLandingPage`,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      const $ = cheerio.load(response.data);

      // Hidden Metadata in Response will be helpful
      const studentData = {
        admissionNumberPKey: $("#hdnAdmissionNumberPKey").val(),
        admissionNumber: $("#hdnAdmissionNumber").val(),
        semesterFKey: $("#hdnSemesterFKey").val(),
        graduation: $("#hdnGraduation").val(),
        name: null,
        course: null,
        phone: null,
      };

      // Extracting visible info from the caption class
      const captionText = $(".caption p")
        .map((i, el) => $(el).text().trim())
        .get();
      if (captionText.length >= 3) {
        studentData.admissionNumber = captionText[0];
        studentData.name = captionText[1];
        studentData.course = captionText[2];
        if (captionText[3]) {
          studentData.phone = captionText[3].replace(/[^\d]/g, "");
        }
      }

      console.log("Student profile successfully extracted");
      console.log("Student Data", studentData);

      return studentData;
    } catch (error) {
      console.error("Error getting student profile", error.message);
      return null;
    }
  }

  async #getAttendanceData(admissionNo, semesterFKey) {
    try {
      console.log("\nFetching attendance data...");
      const response = await this._makeRequest({
        method: "GET",
        url: "/StudentLogin/GetStudentDayWiseAttendancePercentage",
        params: {
          AdmissionNo: admissionNo,
          semester: semesterFKey,
          SemName: semesterFKey,
        },
        headers: {
          Cookie: this._sessionCookie,
          "X-Requested-With": "XMLHttpRequest",
          Accept: "*/*",
        },
      });

      const data = response.data;
      const percentage =
        data.TotalCount > 0
          ? ((data.PresentCount / data.TotalCount) * 100).toFixed(2)
          : 0;

      console.log("✓ Attendance data:");
      console.log(`  Total Periods: ${data.TotalCount}`);
      console.log(`  Attended Periods: ${data.PresentCount}`);
      console.log(`  Attendance %: ${percentage}%`);

      return {
        totalPeriods: data.TotalCount,
        attendedPeriods: data.PresentCount,
        percentage: percentage,
      };
    } catch (error) {
      console.error("✗ Error getting attendance:", error.message);
      return null;
    }
  }

  async #getMarksData(studentFKey, semesterFKey) {
    try {
      console.log("\nFetching Marks Data....");
      const response = await this._makeRequest({
        method: "GET",
        url: "/StudentLogin/GetCIAMarksBarchartData",
        params: {
          StudentFKey: studentFKey,
          SemesterFKey: semesterFKey,
        },
        headers: {
          Cookie: this._sessionCookie,
          "X-Requested-With": "XMLHttpRequest",
          Accept: "*/*",
        },
      });

      const data = response.data;
      console.log(`✓ Marks data received: ${data.length} subjects`);

      if (data && data.length > 0) {
        data.forEach((subject) => {
          console.log(`  ${subject.label}: ${subject.y}%`);
        });
      } else {
        console.log("No marks data available");
      }

      return data;
    } catch (error) {
      console.error("✗ Error getting marks:", error.message);
      return null;
    }
  }

  async getOverallResults(monthYear = "OCT/NOV-2025") {
    try {
      console.log(`\nFetching overall result for ${monthYear}...`);
      const response = await this._makeRequest({
        method: "GET",
        url: "/StudentLogin/OverallResult",
        params: {
          monthYear: monthYear,
        },
        headers: {
          Cookie: this._sessionCookie,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Referer: `${this._baseURL}/StudentLogin/StudentLandingPage`,
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      });

      // Parse HTML response to extract result data
      const $ = cheerio.load(response.data);

      // Extract student basic info
      const studentInfo = {
        name:
          $('p:contains("STUDENT NAME")').text().split(":")[1]?.trim() || null,
        fatherName:
          $('p:contains("FATHER\'S NAME")').text().split(":")[1]?.trim() ||
          null,
        motherName:
          $('p:contains("MOTHER\'S NAME")').text().split(":")[1]?.trim() ||
          null,
        hallTicket:
          $('p:contains("HALL TICKET NO")').text().split(":")[1]?.trim() ||
          null,
        program:
          $('p:contains("PROGRAM")').text().split(":")[1]?.trim() || null,
        monthYear:
          $('p:contains("MONTH & YEAR")').text().split(":")[1]?.trim() || null,
      };

      // Extract semester results
      const semesterResults = [];
      let currentSemester = null;
      let semesterSubjects = [];

      $("tbody.Box.bodyfont tr").each((i, row) => {
        const cells = $(row).find("td");

        // Check if this row contains SGPA (summary row)
        const rowText = $(row).text();

        if (rowText.includes("SGPA:") || rowText.includes("CGPA:")) {
          // Extract SGPA and result
          const sgpaMatch = rowText.match(/SGPA:\s*([\d.]+)/);
          const cgpaMatch = rowText.match(/CGPA:\s*([\d.]+)/);
          const resultMatch = rowText.match(/RESULT:\s*(\w+)/);

          if (currentSemester && semesterSubjects.length > 0) {
            semesterResults.push({
              semester: currentSemester,
              subjects: semesterSubjects,
              sgpa: sgpaMatch ? sgpaMatch[1] : null,
              cgpa: cgpaMatch ? cgpaMatch[1] : null,
              result: resultMatch ? resultMatch[1] : null,
            });
          }

          currentSemester = null;
          semesterSubjects = [];
          return;
        }

        // Check for horizontal rule
        if (rowText.trim() === "") {
          return;
        }

        // Regular subject row
        if (cells.length === 7) {
          const semesterText = $(cells[0]).text().trim();
          const courseCode = $(cells[1]).text().trim();
          const courseTitle = $(cells[2]).text().trim();
          const credits = $(cells[3]).text().trim();
          const grade = $(cells[4]).text().trim();
          const result = $(cells[5]).text().trim();
          const myp = $(cells[6]).text().trim();

          if (semesterText && semesterText !== "") {
            currentSemester = semesterText;
          }

          if (courseCode && courseCode !== "") {
            semesterSubjects.push({
              courseCode: courseCode,
              courseTitle: courseTitle,
              credits: parseInt(credits) || 0,
              grade: grade,
              result: result,
              monthYear: myp,
            });
          }
        } else if (cells.length === 6) {
          // Rows without semester column (continuation of same semester)
          const courseCode = $(cells[0]).text().trim();
          const courseTitle = $(cells[1]).text().trim();
          const credits = $(cells[2]).text().trim();
          const grade = $(cells[3]).text().trim();
          const result = $(cells[4]).text().trim();
          const myp = $(cells[5]).text().trim();

          if (courseCode && courseCode !== "") {
            semesterSubjects.push({
              courseCode: courseCode,
              courseTitle: courseTitle,
              credits: parseInt(credits) || 0,
              grade: grade,
              result: result,
              monthYear: myp,
            });
          }
        }
      });

      // Handle last semester if no summary was found
      if (currentSemester && semesterSubjects.length > 0) {
        semesterResults.push({
          semester: currentSemester,
          subjects: semesterSubjects,
          sgpa: null,
          cgpa: null,
          result: null,
        });
      }

      console.log("✓ Overall result data extracted");

      return {
        monthYear: monthYear,
        student: studentInfo,
        semesters: semesterResults,
        totalSubjects: semesterResults.reduce(
          (acc, sem) => acc + sem.subjects.length,
          0
        ),
      };
    } catch (error) {
      console.error("✗ Error getting overall result:", error.message);
      return null;
    }
  }

  async getCompleteStudentData(hallTicketNo) {
    console.log("\n" + "=".repeat(60));
    console.log(`Processing: ${hallTicketNo}`);
    console.log("=".repeat(60));

    // Step 1: Get session
    const sessionSuccess = await this._getSessionCookie();
    if (!sessionSuccess) {
      return { error: "Failed to get session", hallTicketNo };
    }

    // Step 2: Validate hall ticket
    const validation = await this.#validateHallTicket(hallTicketNo);
    if (!validation) {
      return { error: "Invalid hall ticket", hallTicketNo };
    }

    const data = await this.getOverallResults();

    return data;
    // Step 3: Get student profile
    // const studentProfile = await this.#getStudentProfile();
    // if (!studentProfile) {
    //   return { error: "Failed to get profile", hallTicketNo };
    // }

    // // Step 4: Get attendance
    // const attendance = await this.#getAttendanceData(
    //   studentProfile.admissionNumber,
    //   studentProfile.semesterFKey
    // );

    // // Step 5: Get marks
    // const marks = await this.#getMarksData(
    //   studentProfile.admissionNumberPKey,
    //   studentProfile.semesterFKey
    // );

    // // Compile complete data
    // const completeData = {
    //   hallTicketNo: hallTicketNo,
    //   student: studentProfile,
    //   attendance: attendance,
    //   marks: marks,
    //   yearFkey: validation.yearFkey,
    //   extractedAt: new Date().toISOString(),
    // };

    // console.log("✓ Data extraction complete for " + hallTicketNo);

    // return completeData;
  }

  async processBatch(hallTickets, options = {}) {
    const results = [];
    const errors = [];
    const outputFile = options.outputFile || 'batch_student_data.json';
    const continueOnError = options.continueOnError !== false;

    console.log("\n" + "█".repeat(60));
    console.log(`BATCH PROCESSING: ${hallTickets.length} students`);
    console.log("█".repeat(60));

    for (let i = 0; i < hallTickets.length; i++) {
      const hallTicket = hallTickets[i];

      console.log(
        `\n[${i + 1}/${hallTickets.length}] Processing ${hallTicket}...`
      );

      try {
        const data = await this.getCompleteStudentData(hallTicket);

        if (data.error) {
          errors.push(data);
          console.error(`✗ Failed: ${data.error}`);
        } else {
          results.push(data);
          // console.log(`✓ Success: ${data.student.name}`);
        }

        this.saveResults(results, errors, outputFile);
      } catch (error) {
        console.error(`✗ Unexpected error for ${hallTicket}:`, error.message);
        errors.push({ hallTicketNo: hallTicket, error: error.message });

        if (!continueOnError) {
          break;
        }
      }

      // Add delay between students to avoid rate limiting
      if (i < hallTickets.length - 1) {
        const delayTime = this._delay + Math.random() * 2000;
        console.log(
          `\n⏳ Waiting ${(delayTime / 1000).toFixed(
            1
          )}s before next request...`
        );
        await this._sleep(delayTime);
      }
    }

    // Final summary
    console.log("\n" + "█".repeat(60));
    console.log("BATCH PROCESSING COMPLETE");
    console.log("█".repeat(60));
    console.log(`✓ Successful: ${results.length} Tickets`);
    console.log(`✗ Failed: ${errors.length} Tickets`);

    return { results, errors };
  }

  saveResults(results, errors, filename) {
    const output = {
      summary: {
        total: results.length + errors.length,
        successful: results.length,
        failed: errors.length,
        generatedAt: new Date().toISOString(),
      },
      students: results,
      errors: errors,
    };

    fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  }
}

async function main() {
  const config = {
    rotateUserAgents: true,
    delay: 2000,
  };

  const scraper = new StudentScraper(config);

  const hallTickets = [
    "121423408001",
    "121423408002",
    "121423408003",
    "121423408004",
    "121423408005",
    "121423408006",
    "121423408008",
    "121423408009",
    "121423408010",
    "121423408011",
    "121423408012",
    "121423408013",
    "121423408014",
    "121423408015",
    "121423408016",
    "121423408017",
    "121423408018",
    "121423408019",
    "121423408020",
    "121423408021",
    "121423408023",
    "121423408024",
    "121423408025",
    "121423408026",
    "121423408027",
    "121423408028",
    "121423408029",
    "121423408030",
    "121423408031",
    "121423408033",
    "121423408034",
    "121423408035",
    "121423408036",
    "121423408037",
    "121423408038",
    "121423408039",
    "121423408040",
    "121423408041",
    "121423408042",
    "121423408044",
    "121423408045",
    "121423408046",
    "121423408047",
    "121423408048",
    "121423408050",
    "121423408051",
    "121423408052",
    "121423408053",
    "121423408054",
    "121423408055",
    "121423408056",
    "121423408057",
    "121423408058",
    "121423408059",
    "121423408060",
  ];

  const batchOptions = {
    continueOnError: true,
  };

  await scraper.processBatch(hallTickets, batchOptions);
}

main().catch(console.error);
