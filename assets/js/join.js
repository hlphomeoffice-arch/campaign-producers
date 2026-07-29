(() => {
  const endpoint =
    "https://script.google.com/macros/s/AKfycbyzqBVvIgzzPaUOQ7HyWDaqcqZM1AAS87nCfYSmdbRSLWG2Y-ueq3FrOK_ZHz683iw4/exec";

  const countries = [
    ["AF", "Afghanistan", "AFN"],
    ["AL", "Albania", "ALL"],
    ["DZ", "Algeria", "DZD"],
    ["AS", "American Samoa", "USD"],
    ["AD", "Andorra", "EUR"],
    ["AO", "Angola", "AOA"],
    ["AI", "Anguilla", "XCD"],
    ["AG", "Antigua & Barbuda", "XCD"],
    ["AR", "Argentina", "ARS"],
    ["AM", "Armenia", "AMD"],
    ["AW", "Aruba", "AWG"],
    ["AU", "Australia", "AUD"],
    ["AT", "Austria", "EUR"],
    ["AZ", "Azerbaijan", "AZN"],
    ["BS", "Bahamas", "BSD"],
    ["BH", "Bahrain", "BHD"],
    ["BD", "Bangladesh", "BDT"],
    ["BB", "Barbados", "BBD"],
    ["BY", "Belarus", "BYN"],
    ["BE", "Belgium", "EUR"],
    ["BZ", "Belize", "BZD"],
    ["BJ", "Benin", "XOF"],
    ["BM", "Bermuda", "BMD"],
    ["BT", "Bhutan", "BTN"],
    ["BO", "Bolivia", "BOB"],
    ["BA", "Bosnia & Herzegovina", "BAM"],
    ["BW", "Botswana", "BWP"],
    ["BR", "Brazil", "BRL"],
    ["VG", "British Virgin Islands", "USD"],
    ["BN", "Brunei", "BND"],
    ["BG", "Bulgaria", "EUR"],
    ["BF", "Burkina Faso", "XOF"],
    ["BI", "Burundi", "BIF"],
    ["KH", "Cambodia", "KHR"],
    ["CM", "Cameroon", "XAF"],
    ["CA", "Canada", "CAD"],
    ["CV", "Cape Verde", "CVE"],
    ["BQ", "Caribbean Netherlands", "USD"],
    ["KY", "Cayman Islands", "KYD"],
    ["CF", "Central African Republic", "XAF"],
    ["TD", "Chad", "XAF"],
    ["CL", "Chile", "CLP"],
    ["CN", "China", "CNY"],
    ["CO", "Colombia", "COP"],
    ["KM", "Comoros", "KMF"],
    ["CG", "Congo - Brazzaville", "XAF"],
    ["CD", "Congo - Kinshasa", "CDF"],
    ["CK", "Cook Islands", "NZD"],
    ["CR", "Costa Rica", "CRC"],
    ["CI", "Cote d'Ivoire", "XOF"],
    ["HR", "Croatia", "EUR"],
    ["CU", "Cuba", "CUP"],
    ["CW", "Curacao", "XCG"],
    ["CY", "Cyprus", "EUR"],
    ["CZ", "Czechia", "CZK"],
    ["DK", "Denmark", "DKK"],
    ["DJ", "Djibouti", "DJF"],
    ["DM", "Dominica", "XCD"],
    ["DO", "Dominican Republic", "DOP"],
    ["EC", "Ecuador", "USD"],
    ["EG", "Egypt", "EGP"],
    ["SV", "El Salvador", "USD"],
    ["GQ", "Equatorial Guinea", "XAF"],
    ["ER", "Eritrea", "ERN"],
    ["EE", "Estonia", "EUR"],
    ["SZ", "Eswatini", "SZL"],
    ["ET", "Ethiopia", "ETB"],
    ["FK", "Falkland Islands", "FKP"],
    ["FO", "Faroe Islands", "DKK"],
    ["FJ", "Fiji", "FJD"],
    ["FI", "Finland", "EUR"],
    ["FR", "France", "EUR"],
    ["GF", "French Guiana", "EUR"],
    ["PF", "French Polynesia", "XPF"],
    ["GA", "Gabon", "XAF"],
    ["GM", "Gambia", "GMD"],
    ["GE", "Georgia", "GEL"],
    ["DE", "Germany", "EUR"],
    ["GH", "Ghana", "GHS"],
    ["GI", "Gibraltar", "GIP"],
    ["GR", "Greece", "EUR"],
    ["GL", "Greenland", "DKK"],
    ["GD", "Grenada", "XCD"],
    ["GP", "Guadeloupe", "EUR"],
    ["GU", "Guam", "USD"],
    ["GT", "Guatemala", "GTQ"],
    ["GG", "Guernsey", "GBP"],
    ["GN", "Guinea", "GNF"],
    ["GW", "Guinea-Bissau", "XOF"],
    ["GY", "Guyana", "GYD"],
    ["HT", "Haiti", "HTG"],
    ["HN", "Honduras", "HNL"],
    ["HK", "Hong Kong", "HKD"],
    ["HU", "Hungary", "HUF"],
    ["IS", "Iceland", "ISK"],
    ["IN", "India", "INR"],
    ["ID", "Indonesia", "IDR"],
    ["IR", "Iran", "IRR"],
    ["IQ", "Iraq", "IQD"],
    ["IE", "Ireland", "EUR"],
    ["IM", "Isle of Man", "GBP"],
    ["IL", "Israel", "ILS"],
    ["IT", "Italy", "EUR"],
    ["JM", "Jamaica", "JMD"],
    ["JP", "Japan", "JPY"],
    ["JE", "Jersey", "GBP"],
    ["JO", "Jordan", "JOD"],
    ["KZ", "Kazakhstan", "KZT"],
    ["KE", "Kenya", "KES"],
    ["KI", "Kiribati", "AUD"],
    ["XK", "Kosovo", "EUR"],
    ["KW", "Kuwait", "KWD"],
    ["KG", "Kyrgyzstan", "KGS"],
    ["LA", "Laos", "LAK"],
    ["LV", "Latvia", "EUR"],
    ["LB", "Lebanon", "LBP"],
    ["LS", "Lesotho", "ZAR"],
    ["LR", "Liberia", "LRD"],
    ["LY", "Libya", "LYD"],
    ["LI", "Liechtenstein", "CHF"],
    ["LT", "Lithuania", "EUR"],
    ["LU", "Luxembourg", "EUR"],
    ["MO", "Macao", "MOP"],
    ["MG", "Madagascar", "MGA"],
    ["MW", "Malawi", "MWK"],
    ["MY", "Malaysia", "MYR"],
    ["MV", "Maldives", "MVR"],
    ["ML", "Mali", "XOF"],
    ["MT", "Malta", "EUR"],
    ["MH", "Marshall Islands", "USD"],
    ["MQ", "Martinique", "EUR"],
    ["MR", "Mauritania", "MRU"],
    ["MU", "Mauritius", "MUR"],
    ["MX", "Mexico", "MXN"],
    ["FM", "Micronesia", "USD"],
    ["MD", "Moldova", "MDL"],
    ["MC", "Monaco", "EUR"],
    ["MN", "Mongolia", "MNT"],
    ["ME", "Montenegro", "EUR"],
    ["MS", "Montserrat", "XCD"],
    ["MA", "Morocco", "MAD"],
    ["MZ", "Mozambique", "MZN"],
    ["MM", "Myanmar", "MMK"],
    ["NA", "Namibia", "NAD"],
    ["NR", "Nauru", "AUD"],
    ["NP", "Nepal", "NPR"],
    ["NL", "Netherlands", "EUR"],
    ["NC", "New Caledonia", "XPF"],
    ["NZ", "New Zealand", "NZD"],
    ["NI", "Nicaragua", "NIO"],
    ["NE", "Niger", "XOF"],
    ["NG", "Nigeria", "NGN"],
    ["NU", "Niue", "NZD"],
    ["KP", "North Korea", "KPW"],
    ["MK", "North Macedonia", "MKD"],
    ["NO", "Norway", "NOK"],
    ["OM", "Oman", "OMR"],
    ["PK", "Pakistan", "PKR"],
    ["PW", "Palau", "USD"],
    ["PS", "Palestinian Territories", "ILS"],
    ["PA", "Panama", "PAB"],
    ["PG", "Papua New Guinea", "PGK"],
    ["PY", "Paraguay", "PYG"],
    ["PE", "Peru", "PEN"],
    ["PH", "Philippines", "PHP"],
    ["PL", "Poland", "PLN"],
    ["PT", "Portugal", "EUR"],
    ["PR", "Puerto Rico", "USD"],
    ["QA", "Qatar", "QAR"],
    ["RE", "Reunion", "EUR"],
    ["RO", "Romania", "RON"],
    ["RU", "Russia", "RUB"],
    ["RW", "Rwanda", "RWF"],
    ["WS", "Samoa", "WST"],
    ["SM", "San Marino", "EUR"],
    ["ST", "Sao Tome & Principe", "STN"],
    ["SA", "Saudi Arabia", "SAR"],
    ["SN", "Senegal", "XOF"],
    ["RS", "Serbia", "RSD"],
    ["SC", "Seychelles", "SCR"],
    ["SL", "Sierra Leone", "SLE"],
    ["SG", "Singapore", "SGD"],
    ["SX", "Sint Maarten", "XCG"],
    ["SK", "Slovakia", "EUR"],
    ["SI", "Slovenia", "EUR"],
    ["SB", "Solomon Islands", "SBD"],
    ["SO", "Somalia", "SOS"],
    ["ZA", "South Africa", "ZAR"],
    ["KR", "South Korea", "KRW"],
    ["SS", "South Sudan", "SSP"],
    ["ES", "Spain", "EUR"],
    ["LK", "Sri Lanka", "LKR"],
    ["BL", "St. Barthelemy", "EUR"],
    ["KN", "St. Kitts & Nevis", "XCD"],
    ["LC", "St. Lucia", "XCD"],
    ["MF", "St. Martin", "EUR"],
    ["VC", "St. Vincent & Grenadines", "XCD"],
    ["SD", "Sudan", "SDG"],
    ["SR", "Suriname", "SRD"],
    ["SE", "Sweden", "SEK"],
    ["CH", "Switzerland", "CHF"],
    ["SY", "Syria", "SYP"],
    ["TW", "Taiwan", "TWD"],
    ["TJ", "Tajikistan", "TJS"],
    ["TZ", "Tanzania", "TZS"],
    ["TH", "Thailand", "THB"],
    ["TL", "Timor-Leste", "USD"],
    ["TG", "Togo", "XOF"],
    ["TO", "Tonga", "TOP"],
    ["TT", "Trinidad & Tobago", "TTD"],
    ["TN", "Tunisia", "TND"],
    ["TR", "Turkiye", "TRY"],
    ["TM", "Turkmenistan", "TMT"],
    ["TC", "Turks & Caicos Islands", "USD"],
    ["TV", "Tuvalu", "AUD"],
    ["VI", "U.S. Virgin Islands", "USD"],
    ["UG", "Uganda", "UGX"],
    ["UA", "Ukraine", "UAH"],
    ["AE", "United Arab Emirates", "AED"],
    ["GB", "United Kingdom", "GBP"],
    ["US", "United States", "USD"],
    ["UY", "Uruguay", "UYU"],
    ["UZ", "Uzbekistan", "UZS"],
    ["VU", "Vanuatu", "VUV"],
    ["VA", "Vatican City", "EUR"],
    ["VE", "Venezuela", "VES"],
    ["VN", "Vietnam", "VND"],
    ["WF", "Wallis & Futuna", "XPF"],
    ["EH", "Western Sahara", "MAD"],
    ["YE", "Yemen", "YER"],
    ["ZM", "Zambia", "ZMW"],
    ["ZW", "Zimbabwe", "ZWG"],
  ];

  const webAddressFields = [
    "portfolioUrl",
    "linkedinUrl",
    "workExample1",
    "workExample2",
    "workExample3",
  ];

  const form = document.querySelector("#talent-application-form");
  if (!form) return;

  const countrySelect = form.querySelector("[data-country]");
  const currencySelect = form.querySelector("[data-currency]");
  const timeZoneOutput = form.querySelector("[data-time-zone]");
  const panels = Array.from(form.querySelectorAll("[data-step-panel]"));
  const stepButtons = Array.from(form.querySelectorAll("[data-step-button]"));
  const status = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("[data-submit]");
  const formStartedAt = Date.now();
  let currentStep = 0;
  let completedStep = -1;

  const currencyCodes = Array.from(
    new Set(countries.map((country) => country[2])),
  ).sort();

  function option(value, label) {
    const element = document.createElement("option");
    element.value = value;
    element.textContent = label;
    return element;
  }

  countries.forEach((country) => {
    const element = option(country[1], country[1]);
    element.dataset.code = country[0];
    element.dataset.currency = country[2];
    countrySelect.appendChild(element);
  });

  currencyCodes.forEach((currency) => {
    let label = currency;
    try {
      const displayName = new Intl.DisplayNames(["en"], {
        type: "currency",
      }).of(currency);
      label = `${currency}: ${displayName || currency}`;
    } catch {
      label = currency;
    }
    currencySelect.appendChild(option(currency, label));
  });

  function detectTimeZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable";
    } catch {
      return "Unavailable";
    }
  }

  const detectedTimeZone = detectTimeZone();
  timeZoneOutput.textContent = detectedTimeZone;

  function getCurrencySymbol(currency) {
    if (!currency) return "¤";
    try {
      const part = new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      })
        .formatToParts(0)
        .find((item) => item.type === "currency");
      return part ? part.value : currency;
    } catch {
      return currency;
    }
  }

  function updateCurrencyDisplay() {
    const symbol = getCurrencySymbol(currencySelect.value);
    form.querySelector("[data-day-symbol]").textContent = symbol;
    form.querySelector("[data-week-symbol]").textContent = symbol;
  }

  function setCurrencyFromCountry() {
    const selected = countrySelect.options[countrySelect.selectedIndex];
    if (selected && selected.dataset.currency) {
      currencySelect.value = selected.dataset.currency;
      updateCurrencyDisplay();
    }
  }

  countrySelect.addEventListener("change", setCurrencyFromCountry);
  currencySelect.addEventListener("change", updateCurrencyDisplay);

  function preselectLocaleCountry() {
    const locale =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "";
    const region = locale.match(/[-_]([A-Z]{2})\b/i);
    if (!region) return;

    const target = Array.from(countrySelect.options).find(
      (item) => item.dataset.code === region[1].toUpperCase(),
    );
    if (target) {
      countrySelect.value = target.value;
      setCurrencyFromCountry();
    }
  }

  preselectLocaleCountry();
  updateCurrencyDisplay();

  function normaliseWebAddress(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://www.${trimmed.replace(/^www\./i, "")}`;
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(index, panels.length - 1));

    panels.forEach((panel, panelIndex) => {
      const isCurrent = panelIndex === currentStep;
      panel.hidden = !isCurrent;
      panel.setAttribute("aria-hidden", String(!isCurrent));
    });

    stepButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === currentStep);
      button.classList.toggle("is-complete", buttonIndex <= completedStep);
      button.disabled = buttonIndex > completedStep + 1;
      button.setAttribute(
        "aria-current",
        buttonIndex === currentStep ? "step" : "false",
      );
    });

    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validatePanel(index) {
    const fields = panels[index].querySelectorAll(
      "input, select, textarea",
    );
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  form.addEventListener("click", (event) => {
    const next = event.target.closest("[data-next]");
    const back = event.target.closest("[data-back]");
    const step = event.target.closest("[data-step-button]");

    if (next) {
      if (!validatePanel(currentStep)) return;
      completedStep = Math.max(completedStep, currentStep);
      showStep(currentStep + 1);
    }

    if (back) showStep(currentStep - 1);

    if (step) {
      const index = Number(step.dataset.stepButton);
      if (index <= completedStep + 1) showStep(index);
    }
  });

  function createApplicationId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `cp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function setStatus(type, message) {
    status.hidden = false;
    status.className = `talent-form-status is-${type}`;
    status.textContent = message;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validatePanel(currentStep)) return;
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.firstChild.textContent = "Submitting... ";
    status.hidden = true;

    const formData = new FormData(form);
    const payload = new URLSearchParams();

    formData.forEach((value, key) => {
      payload.set(key, String(value));
    });

    webAddressFields.forEach((field) => {
      payload.set(field, normaliseWebAddress(payload.get(field)));
    });

    payload.set("submissionType", "talentNetwork");
    payload.set("applicationId", createApplicationId());
    payload.set("submittedAt", new Date().toISOString());
    payload.set("formStartedAt", String(formStartedAt));
    payload.set("timeZone", detectedTimeZone);
    payload.set("newsletterConsent", formData.has("newsletterConsent") ? "on" : "off");
    payload.set("source", "https://www.campaignproducers.com/join/");
    payload.set("userAgent", navigator.userAgent || "Unavailable");

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      form.reset();
      completedStep = -1;
      showStep(0);
      preselectLocaleCountry();
      updateCurrencyDisplay();
      setStatus(
        "success",
        "Thank you for applying to join the Campaign Producers talent network. We review every application carefully. If your experience appears relevant to the work we are developing, we will contact you to arrange an introductory conversation. Joining the network does not guarantee a particular volume of work.",
      );
    } catch {
      setStatus(
        "error",
        "We could not submit your application. Please check your connection and try again.",
      );
    } finally {
      submitButton.disabled = false;
      submitButton.firstChild.textContent = "Submit application ";
    }
  });
})();
