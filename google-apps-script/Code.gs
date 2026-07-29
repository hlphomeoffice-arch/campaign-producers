const APPLICATION_SHEET = "Applications";
const PUBLIC_SUBMISSION_TYPE = "talentNetwork";
const PUBLIC_SOURCE = "https://www.campaignproducers.com/join/";

const APPLICATION_HEADERS = [
  "Application ID",
  "Submitted At",
  "Status",
  "Full Name",
  "Email",
  "Telephone",
  "Country",
  "City",
  "Detected Time Zone",
  "Primary Discipline",
  "Secondary Disciplines",
  "Years Experience",
  "Portfolio URL",
  "LinkedIn URL",
  "Work Example 1",
  "Contribution 1",
  "Work Example 2",
  "Contribution 2",
  "Work Example 3",
  "Contribution 3",
  "Day Rate",
  "Weekly Rate",
  "Currency",
  "Availability",
  "AI Approach",
  "Introduction",
  "Accuracy Confirmed",
  "Retention Consent",
  "Privacy Accepted",
  "Newsletter Consent",
  "Source",
  "User Agent",
  "Review Owner",
  "Review Notes",
  "Intro Call Date",
  "References Status",
  "Last Updated",
];

function doGet() {
  return jsonResponse_({
    ok: true,
    service: "Campaign Producers talent applications",
  });
}

function doPost(event) {
  try {
    const request = parseRequest_(event);
    const payload = request.payload;
    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty("TALENT_SPREADSHEET_ID");

    if (!spreadsheetId) {
      throw new Error("TALENT_SPREADSHEET_ID is not configured.");
    }

    if (request.isJson) {
      const expectedToken = properties.getProperty("TALENT_WEBHOOK_TOKEN");
      if (!expectedToken) {
        throw new Error("TALENT_WEBHOOK_TOKEN is not configured.");
      }
      if (payload.integrationToken !== expectedToken) {
        return jsonResponse_({ ok: false, error: "Unauthorised" });
      }
    } else {
      if (payload.submissionType !== PUBLIC_SUBMISSION_TYPE) {
        return jsonResponse_({ ok: false, error: "Invalid submission type." });
      }
      if (String(payload.website || "").trim()) {
        return jsonResponse_({ ok: true, discarded: true });
      }
      validatePublicSubmission_(payload);
      payload.applicationId =
        String(payload.applicationId || "").trim() || Utilities.getUuid();
      payload.submittedAt = new Date().toISOString();
      payload.source = PUBLIC_SOURCE;
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(APPLICATION_SHEET);

    if (!sheet) {
      throw new Error('The "Applications" sheet does not exist.');
    }

    assertHeaders_(sheet);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const existingApplication = findApplication_(
        sheet,
        payload.applicationId,
      );

      if (existingApplication) {
        return jsonResponse_({
          ok: true,
          applicationId: payload.applicationId,
          duplicate: true,
        });
      }

      if (!request.isJson && isRateLimited_(payload.email)) {
        return jsonResponse_({
          ok: true,
          accepted: false,
          rateLimited: true,
        });
      }

      const now = new Date();
      const row = [
        safeCell_(payload.applicationId),
        safeCell_(payload.submittedAt),
        "New",
        safeCell_(payload.fullName),
        safeCell_(payload.email),
        safeCell_(payload.telephone),
        safeCell_(payload.country),
        safeCell_(payload.city),
        safeCell_(payload.timeZone),
        safeCell_(payload.primaryDiscipline),
        safeCell_(payload.secondaryDisciplines),
        safeNumber_(payload.yearsExperience),
        safeCell_(payload.portfolioUrl),
        safeCell_(payload.linkedinUrl),
        safeCell_(payload.workExample1),
        safeCell_(payload.workContribution1),
        safeCell_(payload.workExample2),
        safeCell_(payload.workContribution2),
        safeCell_(payload.workExample3),
        safeCell_(payload.workContribution3),
        safeNumber_(payload.dayRate),
        safeNumber_(payload.weeklyRate),
        safeCell_(payload.currency),
        safeCell_(payload.availability),
        safeCell_(payload.aiApproach),
        safeCell_(payload.introduction),
        safeBoolean_(payload.accuracyConfirmed),
        safeBoolean_(payload.retentionConsent),
        safeBoolean_(payload.privacyAccepted),
        safeBoolean_(payload.newsletterConsent),
        safeCell_(payload.source),
        safeCell_(payload.userAgent),
        "",
        "",
        "",
        "Not requested",
        now,
      ];

      const targetRow = findNextApplicationRow_(sheet);
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);

      if (!request.isJson) {
        rememberSubmission_(payload.email);
      }
    } finally {
      lock.releaseLock();
    }

    let acknowledgementSent = false;
    try {
      sendAcknowledgement_(payload.email, payload.fullName);
      acknowledgementSent = Boolean(payload.email);
    } catch (error) {
      console.error("Acknowledgement email failed", error);
    }

    return jsonResponse_({
      ok: true,
      applicationId: payload.applicationId,
      acknowledgementSent: acknowledgementSent,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function parseRequest_(event) {
  const postData = event && event.postData ? event.postData : {};
  const contentType = String(postData.type || "").toLowerCase();
  const isJson = contentType.indexOf("application/json") >= 0;

  if (isJson) {
    return {
      isJson: true,
      payload: JSON.parse(postData.contents || "{}"),
    };
  }

  return {
    isJson: false,
    payload: Object.assign({}, (event && event.parameter) || {}),
  };
}

function validatePublicSubmission_(payload) {
  const requiredText = [
    "fullName",
    "email",
    "country",
    "city",
    "timeZone",
    "primaryDiscipline",
    "yearsExperience",
    "portfolioUrl",
    "workExample1",
    "workContribution1",
    "currency",
    "dayRate",
    "availability",
    "aiApproach",
    "introduction",
  ];

  requiredText.forEach(function (field) {
    if (!String(payload[field] || "").trim()) {
      throw new Error("A required application field is missing.");
    }
  });

  if (
    !safeBoolean_(payload.accuracyConfirmed) ||
    !safeBoolean_(payload.retentionConsent) ||
    !safeBoolean_(payload.privacyAccepted)
  ) {
    throw new Error("Required application consent is missing.");
  }

  const email = String(payload.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    throw new Error("The email address is invalid.");
  }

  const yearsExperience = Number(payload.yearsExperience);
  const dayRate = Number(payload.dayRate);
  const weeklyRate = String(payload.weeklyRate || "").trim();

  if (
    !Number.isFinite(yearsExperience) ||
    yearsExperience < 1 ||
    yearsExperience > 70
  ) {
    throw new Error("Years of experience is invalid.");
  }

  if (!Number.isFinite(dayRate) || dayRate <= 0) {
    throw new Error("The day rate is invalid.");
  }

  if (
    weeklyRate &&
    (!Number.isFinite(Number(weeklyRate)) || Number(weeklyRate) <= 0)
  ) {
    throw new Error("The weekly rate is invalid.");
  }

  [
    "portfolioUrl",
    "linkedinUrl",
    "workExample1",
    "workExample2",
    "workExample3",
  ].forEach(function (field) {
    const value = String(payload[field] || "").trim();
    if (value && !/^https?:\/\/[^\s]+$/i.test(value)) {
      throw new Error("A submitted website address is invalid.");
    }
  });

  const maximumLengths = {
    fullName: 120,
    email: 180,
    telephone: 60,
    country: 120,
    city: 120,
    timeZone: 120,
    primaryDiscipline: 180,
    secondaryDisciplines: 250,
    portfolioUrl: 500,
    linkedinUrl: 500,
    workExample1: 500,
    workContribution1: 1500,
    workExample2: 500,
    workContribution2: 1500,
    workExample3: 500,
    workContribution3: 1500,
    currency: 12,
    availability: 250,
    aiApproach: 2000,
    introduction: 2500,
    source: 300,
    userAgent: 500,
  };

  Object.keys(maximumLengths).forEach(function (field) {
    if (String(payload[field] || "").length > maximumLengths[field]) {
      throw new Error("An application field is too long.");
    }
  });

  const startedAt = Number(payload.formStartedAt);
  if (
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt < 2000
  ) {
    throw new Error("The application was submitted too quickly.");
  }
}

function assertHeaders_(sheet) {
  const currentHeaders = sheet
    .getRange(1, 1, 1, APPLICATION_HEADERS.length)
    .getDisplayValues()[0];

  for (let index = 0; index < APPLICATION_HEADERS.length; index += 1) {
    if (currentHeaders[index] !== APPLICATION_HEADERS[index]) {
      throw new Error(
        "Applications sheet headers do not match the approved intake schema.",
      );
    }
  }
}

function findNextApplicationRow_(sheet) {
  const maxRows = sheet.getMaxRows();
  const applicationIds = sheet
    .getRange(2, 1, Math.max(maxRows - 1, 1), 1)
    .getDisplayValues();

  const firstEmptyOffset = applicationIds.findIndex(function (row) {
    return !String(row[0] || "").trim();
  });

  if (firstEmptyOffset >= 0) {
    return firstEmptyOffset + 2;
  }

  sheet.insertRowAfter(maxRows);
  return maxRows + 1;
}

function findApplication_(sheet, applicationId) {
  const safeApplicationId = String(applicationId || "").trim();
  const dataRows = sheet.getLastRow() - 1;

  if (!safeApplicationId || dataRows < 1) return null;

  return sheet
    .getRange(2, 1, dataRows, 1)
    .createTextFinder(safeApplicationId)
    .matchEntireCell(true)
    .findNext();
}

function submissionCacheKey_(email) {
  const normalised = String(email || "").trim().toLowerCase();
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    normalised,
    Utilities.Charset.UTF_8,
  );
  return (
    "talent-" +
    digest
      .slice(0, 12)
      .map(function (byte) {
        return ("0" + ((byte + 256) % 256).toString(16)).slice(-2);
      })
      .join("")
  );
}

function isRateLimited_(email) {
  return Boolean(CacheService.getScriptCache().get(submissionCacheKey_(email)));
}

function rememberSubmission_(email) {
  CacheService.getScriptCache().put(submissionCacheKey_(email), "1", 120);
}

function sendAcknowledgement_(email, fullName) {
  if (!email) return;

  const firstName = String(fullName || "").trim().split(/\s+/)[0] || "there";
  const subject = "Campaign Producers talent network application";
  const body = [
    "Hi " + firstName + ",",
    "",
    "Thank you for applying to join the Campaign Producers talent network. We review every application carefully. If your experience appears relevant to the work we are developing, we will contact you to arrange an introductory conversation.",
    "",
    "Please note that joining the network does not guarantee a particular volume of work.",
    "",
    "Campaign Producers",
  ].join("\n");

  MailApp.sendEmail({
    to: String(email),
    subject: subject,
    body: body,
    name: "Campaign Producers",
  });
}

function safeCell_(value) {
  const text = String(value == null ? "" : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeNumber_(value) {
  if (value === "" || value == null) return "";
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function safeBoolean_(value) {
  return value === true || value === "true" || value === "on";
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
