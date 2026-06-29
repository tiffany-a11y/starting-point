const REQUEST_FORM_URL = "https://script.google.com/macros/s/AKfycbwyc-Hp6CrQs6dJN1Rz5s7flQvAugWR942oR6p7KwLZnANgxjv360rPXBD55gfEMfsCbA/exec";
const approvedTags = [
  "ADHD",
  "Anxiety",
  "Behavior Counseling",
  "BIPOC",
  "Burnout",
  "Couples Counseling",
  "Depression",
  "Divorce",
  "Domestic Violence",
  "Eating Disorders",
  "Family Counseling",
  "Gender Identity",
  "Gifted & Talented",
  "Grief",
  "LGBTQ+",
  "Learning Differences",
  "Life Transitions",
  "Men's Issues",
  "OCD",
  "Parenting",
  "Parent/Child Conflict",
  "PTSD",
  "Relationships",
  "Self-Harm",
  "Spectrum Disorders",
  "Sports Trauma",
  "Spiritual Counseling",
  "Substance Abuse",
  "Suicidal Ideation",
  "Trauma",
  "Women's Issues"
];

const insuranceLabels = {
  aetna: "Aetna",
  bcbstx: "BCBSTX",
  uhc: "UHC/UMR/Optum",
  privatePay: "Private Pay",
  notSure: "Not Sure"
};

const meetingLabels = {
  inPerson: "In-Person Sessions",
  online: "Online Sessions",
  either: "In-Person or Online Sessions"
};

const availabilityLabels = {
  weekdayDaytime: "Weekday Daytime",
  weekdayEvening: "Weekday Evening",
  weekend: "Weekend",
  flexible: "Flexible Appointment Times"
};

const concernContainer = document.getElementById("concernContainer");

concernContainer.innerHTML = "";

approvedTags.forEach(tag => {
  const label = document.createElement("label");

  label.innerHTML = `
    <input type="checkbox" value="${tag}">
    <span>${tag}</span>
  `;

  concernContainer.appendChild(label);
});

concernContainer.style.display = "grid";

const servicePathSelect = document.getElementById("servicePath");
const matchButton = document.getElementById("matchButton");
const insuranceSection = document.getElementById("insuranceSection");
const meetingSection = document.getElementById("meetingSection");
const availabilitySection = document.getElementById("availabilitySection");

const clientTypeSelect = document.getElementById("clientType");
const clientTypeHeading = clientTypeSelect.previousElementSibling;

const concernHeading = concernContainer.previousElementSibling;

function updateServicePathUI(){
  const results = document.getElementById("results");

  if (servicePathSelect.value === "evaluation") {

    document.getElementById("clientType").value = "adults";
    document.getElementById("insurance").value = "privatePay";
    document.getElementById("meetingPreference").value = "online";
    document.getElementById("availability").value = "flexible";

    clientTypeHeading.style.display = "none";
    clientTypeSelect.style.display = "none";
    concernHeading.style.display = "none";
    concernContainer.style.display = "none";
    insuranceSection.style.display = "none";
    meetingSection.style.display = "none";
    availabilitySection.style.display = "none";

    matchButton.style.display = "none";

    displayEvaluationResult();

  } else if (servicePathSelect.value === "notSure") {

    clientTypeHeading.style.display = "none";
    clientTypeSelect.style.display = "none";
    concernHeading.style.display = "none";
    concernContainer.style.display = "none";
    insuranceSection.style.display = "none";
    meetingSection.style.display = "none";
    availabilitySection.style.display = "none";

    matchButton.style.display = "none";

    displayNotSureResult();

  } else {

    clientTypeHeading.style.display = "block";
    clientTypeSelect.style.display = "block";
    concernHeading.style.display = "block";
    concernContainer.style.display = "grid";
    insuranceSection.style.display = "block";
    meetingSection.style.display = "block";
    availabilitySection.style.display = "block";

    matchButton.style.display = "inline-block";

    results.innerHTML = "";
  }
}

servicePathSelect.addEventListener("change", updateServicePathUI);

document.getElementById("matchForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const servicePath = document.getElementById("servicePath").value;
  const clientType = document.getElementById("clientType").value;
  const insurance = document.getElementById("insurance").value;
  const meetingPreference = document.getElementById("meetingPreference").value;
  const availability = document.getElementById("availability").value;

  const selectedConcerns = Array.from(
    document.querySelectorAll('#concernContainer input:checked')
  ).map(cb => cb.value);

  const results = document.getElementById("results");

  if (!servicePath) {
    results.innerHTML = `
      <div class="match-card">
        <h2>Please select a service type</h2>
        <p>Please choose Therapy, Mental Health Checkup, Psychological Evaluation, or Not Sure before continuing.</p>
      </div>
    `;
    return;
  }

  if (servicePath === "evaluation") {
    displayEvaluationResult();
    return;
  }

  if (servicePath === "notSure") {
  displayNotSureResult();
  return;
}

  if (!clientType || !insurance || !meetingPreference || !availability || selectedConcerns.length === 0) {
    results.innerHTML = `
      <div class="match-card">
        <h2>Please complete the form</h2>
        <p>Please select who is seeking services, at least one concern, insurance, meeting preference, and availability.</p>
      </div>
    `;
    return;
  }

  const scoredProviders = [];

  providers.forEach(provider => {
    if (!provider.acceptingNewClients) return;
    if (!provider[clientType]) return;
    if (meetingPreference !== "either" && !provider[meetingPreference]) return;

    let score = 0;
    const matchReasons = [];

    if (
      clientType === "couples" &&
      (meetingPreference === "online" || meetingPreference === "either") &&
      provider.providerName === "Christie Greeley"
    ) {
      score += 100;
      matchReasons.push("Recommended for virtual couples counseling");
    }

    if (
  clientType === "adults" &&
  ["Depression", "Anxiety", "Trauma", "PTSD"].some(concern => selectedConcerns.includes(concern)) &&
  provider.providerName === "Lisa Landry"
) {
  score += 120;
}

if (
  clientType === "adults" &&
  ["Depression", "Anxiety", "Trauma", "PTSD"].some(concern => selectedConcerns.includes(concern)) &&
  provider.providerName === "Jan Leger"
) {
  score += 90;
}

if (
  clientType === "adults" &&
  ["Depression", "Anxiety", "LGBTQ+"].some(concern => selectedConcerns.includes(concern)) &&
  provider.providerName === "Christie Greeley"
) {
  score += 70;
}
    selectedConcerns.forEach(concern => {
      if (provider.concerns.includes(concern)) {
        score += 10;
        matchReasons.push(`Specializes in ${concern}`);
      }
    });

    if (insurance !== "notSure" && provider[insurance]) {
      score += 5;
      matchReasons.push(`Accepts ${insuranceLabels[insurance]}`);
    }

    if (meetingPreference !== "either" && provider[meetingPreference]) {
      score += 4;
      matchReasons.push(`Offers ${meetingLabels[meetingPreference]}`);
    }

    if (meetingPreference === "either" && (provider.inPerson || provider.online)) {
      score += 2;
      matchReasons.push("Matches your preference for either online or in-person care");
    }

    if (provider[availability]) {
      score += 4;
      matchReasons.push(`Matches your preference for ${availabilityLabels[availability]}`);
    }

    if (provider.flexible && availability !== "flexible") {
      score += 2;
      matchReasons.push("May offer additional scheduling options");
    }

    scoredProviders.push({
      provider,
      score,
      matchReasons
    });
  });

  scoredProviders.sort((a, b) => b.score - a.score);

  displayResults(scoredProviders.slice(0, 3), servicePath);
});

function displayEvaluationResult(){
  const results = document.getElementById("results");

  results.innerHTML = `
    <div class="match-card">

      <div class="best-match">Psychological Evaluation</div>

      <div class="provider-card-layout">

        <img 
        src="images/rhonda-polakoff.jpg" 
        alt="Dr. Rhonda Polakoff" 
        class="provider-photo"
        >

        <div class="provider-info">

          <h2>Dr. Rhonda Polakoff</h2>

          <div class="evaluation-notice">
            Psychological evaluations are offered online only, with flexible scheduling, and are available by private pay only.
          </div>

          <p>
            Psychological evaluations at Landry Therapy Group are completed by Dr. Rhonda Polakoff.
          </p>

          <div class="match-reasons">
            <h3>Important Details</h3>
            <ul>
              <li>✓ Psychological evaluations only</li>
              <li>✓ Online appointments only</li>
              <li>✓ Private pay only</li>
              <li>✓ Flexible scheduling</li>
              <li>✓ No 15-minute consultation required</li>
            </ul>
          </div>

          <div class="actions">

            <a href="https://landrytherapygroup.com/contact" target="_blank">
              Request Psychological Evaluation
            </a>

            <a href="tel:2143064898">
              Talk With Tiffany
            </a>

            <a href="mailto:Tiffany@landrytherapygroup.com">
              Email Tiffany
            </a>

          </div>

        </div>

      </div>

    </div>
  `;

  results.innerHTML += getEvaluationTiffanyCard();
}

function displayResults(matches, servicePath){
  const results = document.getElementById("results");

  results.innerHTML = "";

  if (servicePath === "mhc") {
  results.innerHTML += `
    <div class="match-card">
      <div class="best-match">🧠 Mental Health Checkup</div>
      <p>
      A Mental Health Checkup is a one-time proactive appointment designed to review emotional wellbeing, stress, coping skills, relationships, and overall mental health. Based on your answers, these clinicians may be a good fit for your checkup.
      </p>
    </div>
  `;
}

  matches.forEach((match, index) => {
    results.innerHTML += `
      <div class="match-card">

        ${index === 0 ? `<div class="best-match">🏆 Best Match</div>` : ""}
        ${index === 1 ? `<div class="best-match">🥈 Excellent Match</div>` : ""}
        ${index === 2 ? `<div class="best-match">🥉 Strong Match</div>` : ""}

        <div class="provider-card-layout">

          <img 
          src="${match.provider.photo}" 
          alt="${match.provider.providerName}" 
          class="provider-photo"
          >

          <div class="provider-info">

            <h2>${match.provider.providerName}</h2>

            <p>
              ${match.provider.bio || "We recommend this clinician based on your needs and preferences."}
            </p>

            <div class="match-reasons">
            <h3>Why We Matched You</h3>

             ${match.matchReasons.map(reason => `
              <p>✓ ${reason}</p>
            `).join("")}

            </div>
            <div class="actions">

  <a href="${match.provider.fullBioUrl}" target="_blank">
    View Full Bio
  </a>

  <button
  type="button"
  class="request-button"
  onclick="openRequestModal('${match.provider.providerName}', 'Appointment')"
  >
    Request Appointment
  </button>

  <button
  type="button"
  class="request-button secondary-request"
  onclick="openRequestModal('${match.provider.providerName}', 'Consultation')"
  >
    Free Consultation
  </button>

</div>

          </div>

        </div>

      </div>
    `;
  });

  results.innerHTML += getStandardTiffanyCard();
}

function getStandardTiffanyCard(){
  return `
    <div class="tiffany-help-card">

      <img
      src="images/tiffany-brown.jpg"
      alt="Tiffany Brown"
      class="tiffany-photo"
      >

      <div class="tiffany-info">

        <h2>Talk With Tiffany</h2>

        <p class="tiffany-subtitle">
          Questions? Need Help Choosing?
        </p>

        <h3>Tiffany Brown</h3>

        <p class="tiffany-title">
          Client Care & Practice Operations
        </p>

        <p>
          Finding the right therapist is a personal decision, and taking that first step can sometimes feel overwhelming. I'm here to help make the process easier.
        </p>

        <p>
          I work closely with each clinician on our team and can answer questions about specialties, treatment approaches, scheduling, insurance, and which therapist may be the best fit for your unique situation.
        </p>

        <p>
          Most importantly, I am a real person—not a chatbot or automated system. When you call or email, you'll connect directly with me. If you're unsure where to start, need help understanding your options, or simply want guidance in finding the right fit, I'm happy to help.
        </p>

        <div class="actions">

          <a href="tel:2143064898">
            Call Tiffany
          </a>

          <a href="mailto:Tiffany@landrytherapygroup.com">
            Email Tiffany
          </a>

        </div>

      </div>

    </div>
  `;
}

function getEvaluationTiffanyCard(){
  return `
    <div class="tiffany-help-card">

      <img
      src="images/tiffany-brown.jpg"
      alt="Tiffany Brown"
      class="tiffany-photo"
      >

      <div class="tiffany-info">

        <h2>Talk With Tiffany</h2>

        <p class="tiffany-subtitle">
          Questions About Psychological Evaluations?
        </p>

        <h3>Tiffany Brown</h3>

        <p class="tiffany-title">
          Client Care & Practice Operations
        </p>

        <p>
          Psychological evaluations are different from therapy services. I can help answer questions about the evaluation process, private pay details, scheduling, and whether this service may be the right fit.
        </p>

        <p>
          I am a real person—not a chatbot or automated system. When you call or email, you'll connect directly with me.
        </p>

        <div class="actions">

          <a href="tel:2143064898">
            Call Tiffany
          </a>

          <a href="mailto:Tiffany@landrytherapygroup.com">
            Email Tiffany
          </a>

        </div>

      </div>

    </div>
  `;
}

function displayNotSureResult(){
  const results = document.getElementById("results");

  results.innerHTML = `
    <div class="match-card">

      <div class="best-match">Not Sure Where to Start?</div>

      <h2>That’s completely okay.</h2>

      <p>
        Many people know they want support but are not sure whether therapy, a Mental Health Checkup, or a Psychological Evaluation is the best fit. We can help you figure that out.
      </p>

      <div class="match-reasons">

        <h3>Common Starting Points</h3>

        <div class="not-sure-options">

          <p>
            ✓ <strong>Therapy:</strong> Ongoing support for anxiety, depression, trauma, relationships, stress, and life challenges.
          </p>

          <p>
            ✓ <strong>Mental Health Checkup:</strong> A one-time proactive appointment to review emotional wellbeing, stress, coping skills, and overall mental wellness.
          </p>

          <p>
            ✓ <strong>Psychological Evaluation:</strong> A specialized assessment for diagnostic clarity, ADHD, autism spectrum concerns, learning differences, and other psychological questions.
          </p>

        </div>

      </div>

    </div>
  `;

  results.innerHTML += getStandardTiffanyCard();
}

function getSelectedConcernsText(){
  return Array.from(
    document.querySelectorAll('#concernContainer input:checked')
  ).map(cb => cb.value).join(", ");
}

function getServiceLabel(value){
  const labels = {
    therapy: "Therapy",
    mhc: "Mental Health Checkup",
    evaluation: "Psychological Evaluation",
    notSure: "Not Sure"
  };

  return labels[value] || value;
}

function getClientTypeLabel(value){
  const labels = {
    children: "Child",
    teens: "Teen",
    adults: "Adult",
    couples: "Couple",
    families: "Family"
  };

  return labels[value] || value;
}

function openRequestModal(providerName, requestType){
  const servicePath = document.getElementById("servicePath").value;
  const clientType = document.getElementById("clientType").value;
  const insurance = document.getElementById("insurance").value;
  const meetingPreference = document.getElementById("meetingPreference").value;
  const availability = document.getElementById("availability").value;

  const scheduleWord = requestType === "Appointment" ? "appointment" : "consultation";

  document.body.insertAdjacentHTML("beforeend", `
    <div class="request-modal-overlay" id="requestModal">

      <div class="request-modal">

        <button class="modal-close" onclick="closeRequestModal()">×</button>

        <img
          src="images/ltg-icon.png"
          alt="Landry Therapy Group"
          class="concierge-logo"
        >

        <h2>Review & Submit Your Request</h2>

        <hr class="concierge-divider">

        <p>
  We've gathered the information below based on your selections. Please review it for accuracy before submitting your request.
</p>
<h3>Here's What We Received</h3>
        <div class="request-summary">
          <p>✓ <strong>Your Selected Clinician:</strong> ${providerName}</p>
<p>✓ <strong>Service Requested:</strong> ${getServiceLabel(servicePath)}</p>
<p>✓ <strong>Who is Seeking Services:</strong> ${getClientTypeLabel(clientType)}</p>
<p>✓ <strong>Areas You'd Like Help With:</strong> ${getSelectedConcernsText()}</p>
<p>✓ <strong>Your Insurance:</strong> ${insuranceLabels[insurance]}</p>
<p>✓ <strong>Your Meeting Preference:</strong> ${meetingLabels[meetingPreference]}</p>
<p>✓ <strong>Your Availability:</strong> ${availabilityLabels[availability]}</p>
        </div>

        <label class="request-label">
  First Name
</label>

<input
  type="text"
  id="clientFirstName"
  class="request-input"
  placeholder="First Name"
>

<label class="request-label">
  Last Name
</label>

<input
  type="text"
  id="clientLastName"
  class="request-input"
  placeholder="Last Name"
>

<label class="request-label">
  Email
</label>

<input
  type="email"
  id="clientEmail"
  class="request-input"
  placeholder="you@example.com"
>

        <label class="request-label">
          Anything you'd like your therapist to know before we contact you? 
        </label>

        <textarea
          id="clientMessage"
          class="request-textarea"
          rows="4"
           placeholder="Optional"
        ></textarea>

        <div class="request-actions">

          <button
            type="button"
            class="update-button"
            onclick="updateMyChoices()"
          >
            ← Update My Choices
          </button>

          <button
            type="button"
            class="submit-request-button"
            onclick="submitRequestTest('${requestType}')"
          >
            Submit Request
          </button>

        </div>

      </div>

    </div>
  `);
}

function closeRequestModal(){
  const modal = document.getElementById("requestModal");
  if(modal){
    modal.remove();
  }
}

function updateMyChoices(){
  closeRequestModal();
  document.getElementById("matchForm").scrollIntoView({ behavior: "smooth" });
}

function submitRequestTest(requestType){
const firstName = document.getElementById("clientFirstName").value.trim();
const lastName = document.getElementById("clientLastName").value.trim();
const email = document.getElementById("clientEmail").value.trim();
  const message = document.getElementById("clientMessage").value.trim();

  if(!firstName){
    alert("Please enter your first name.");
    return;
}

if(!lastName){
    alert("Please enter your last name.");
    return;
}

if(!email){
    alert("Please enter your email address.");
    return;
}

  const submitButton = document.querySelector(".submit-request-button");
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  const servicePath = document.getElementById("servicePath").value;
  const clientType = document.getElementById("clientType").value;
  const insurance = document.getElementById("insurance").value;
  const meetingPreference = document.getElementById("meetingPreference").value;
  const availability = document.getElementById("availability").value;

  const payload = {
    requestType: requestType,
    providerName: document.querySelector(".request-summary p").innerText.replace("✓ Your Selected Clinician:", "").trim(),
    servicePath: getServiceLabel(servicePath),
    clientType: getClientTypeLabel(clientType),
    concerns: getSelectedConcernsText(),
    insurance: insuranceLabels[insurance],
    meetingPreference: meetingLabels[meetingPreference],
    availability: availabilityLabels[availability],
    clientFirstName: firstName,
    clientLastName: lastName,
    clientEmail: email,
    message: message
  };

  fetch(REQUEST_FORM_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  })
  .then(() => {
    showRequestSuccess(requestType);
  })
  .catch(() => {
    alert("Something went wrong. Please try again.");
    submitButton.textContent = "Submit Request";
    submitButton.disabled = false;
  });
}

function showRequestSuccess(requestType){
  const scheduleWord = requestType === "Appointment" ? "appointment" : "consultation";

  const modal = document.querySelector(".request-modal");

  modal.innerHTML = `
    <img
      src="images/ltg-icon.png"
      alt="Landry Therapy Group"
      class="concierge-logo"
    >

    <div class="success-check">✓</div>

    <h2>Thank You!</h2>

    <p class="success-message">
      Your ${scheduleWord} request has been received.
    </p>

    <p class="success-message">
      We'll contact you shortly to help you get started.
    </p>
  `;

  setTimeout(() => {
    closeRequestModal();
  }, 3500);
}
