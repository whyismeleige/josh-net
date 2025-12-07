const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const API_URL = "api-url"; // Change to your API endpoint
const USER_ID = "userId"; // Change to your actual user ID
const BATCH_SIZE = 10; // Upload 10 files at a time
const TOTAL_FILES = 100;

const subjects = [
  { name: "Management Information Systems", code: "BBA501" },
  { name: "Business Analytics", code: "BBA502" },
  { name: "Digital Marketing", code: "BBA503" },
  { name: "Database Management Systems", code: "BBA504" },
  { name: "E-Commerce", code: "BBA505" },
  { name: "Enterprise Resource Planning", code: "BBA506" },
  { name: "Software Project Management", code: "BBA507" },
  { name: "Web Technologies", code: "BBA508" },
];

const semesters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const fileTypes = ["lecture_notes", "exam_papers"];
const statuses = ["published", "draft", "in_review"];
const visibilities = ["public", "course_enrolled", "faculty_only"];

const descriptions = [
  "Comprehensive notes covering all key concepts",
  "Detailed explanation with examples",
  "Important topics for exam preparation",
  "Complete module overview with diagrams",
  "Previous year question paper analysis",
  "Chapter-wise summary notes",
  "Practical examples and case studies",
  "Quick revision notes for exams",
];

function createDummyPDF(filename) {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${filename}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;

  return Buffer.from(content);
}

function generateDummyData(count) {
  const filesData = [];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  for (let i = 0; i < count; i++) {
    const fileType = fileTypes[i % fileTypes.length];
    const status = statuses[i % statuses.length];
    const visibility = visibilities[i % visibilities.length];
    const description = descriptions[i % descriptions.length];

    const unit = Math.floor(i / subjects.length) + 1;
    const filename = `${subject.code}_Unit${unit}_${fileType}_${i + 1}.pdf`;

    filesData.push({
      filename,
      data: {
        userId: USER_ID,
        description: `${description} - Unit ${unit}`,
        academicDetails: {
          course: "BBA - IT",
          semester: "Semester - V",
          year: "R23",
          subjectName: subject.name,
          subjectCode: subject.code,
        },
        fileType: fileType,
        status: status,
        visibility: visibility,
        downloadAllowed: true,
        sharingAllowed: true,
      },
    });
  }

  return filesData;
}

async function uploadBatch(batchData) {
  const formData = new FormData();

  batchData.forEach(({ filename }) => {
    const fileBuffer = createDummyPDF(filename);
    formData.append("files", fileBuffer, {
      filename: filename,
      contentType: "application/pdf",
    });
  });

  // Append metadata
  const filesData = batchData.map(({ data }) => data);
  formData.append("filesData", JSON.stringify(filesData));

  try {
    const response = await axios.post(
      `${API_URL}?path=BBA-IT/Semester - V/${
        subjects[Math.floor(Math.random() * subjects.length)].name
      }`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer Token`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    throw error;
  }
}

async function uploadDummyData() {
  console.log(`Generating ${TOTAL_FILES} dummy files...`);
  const allFilesData = generateDummyData(TOTAL_FILES);

  console.log(`Uploading in batches of ${BATCH_SIZE}...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allFilesData.length; i += BATCH_SIZE) {
    const batch = allFilesData.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allFilesData.length / BATCH_SIZE);

    console.log(
      `\nUploading batch ${batchNumber}/${totalBatches} (${batch.length} files)...`
    );

    try {
      const result = await uploadBatch(batch);
      successCount += batch.length;
      console.log(`✓ Batch ${batchNumber} uploaded successfully`);
      console.log(`  Response: ${result.message}`);
    } catch (error) {
      failCount += batch.length;
      console.error(`✗ Batch ${batchNumber} failed`);
    }

    // Add a small delay between batches to avoid overwhelming the server
    if (i + BATCH_SIZE < allFilesData.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n=================================");
  console.log("Upload Complete!");
  console.log(`Total: ${TOTAL_FILES} files`);
  console.log(`Success: ${successCount} files`);
  console.log(`Failed: ${failCount} files`);
  console.log("=================================");
}

// Run the script
uploadDummyData()
  .then(() => {
    console.log("\nScript finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nScript failed:", error);
    process.exit(1);
  });
