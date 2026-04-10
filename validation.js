const MIN_TEXT_LENGTH = 2;

const FIELD_MESSAGES = {
	firstName: {
		required: "Please enter your first name.",
		invalid: "First name must contain at least 2 letters."
	},
	lastName: {
		required: "Please enter your last name.",
		invalid: "Last name must contain at least 2 letters."
	},
	email: {
		required: "Please enter your email address.",
		invalid: "Enter a valid email address (for example: name@domain.com)."
	},
	phone: {
		required: "Please enter your phone number.",
		invalid: "Phone number must include at least 7 digits."
	},
	country: {
		required: "Please select your country.",
		invalid: "Please select your country."
	},
	city: {
		required: "Please enter your city.",
		invalid: "City name must contain at least 2 characters."
	},
	department: {
		required: "Please choose the department you want to work with.",
		invalid: "Please choose the department you want to work with."
	},
	market: {
		required: "Please select a primary market.",
		invalid: "Please select a primary market."
	},
	availability: {
		required: "Please provide your weekly availability.",
		invalid: "Availability must be a number between 5 and 60 hours."
	},
	challenge: {
		required: "Please describe the first Brasaland challenge you would solve.",
		invalid: "Share at least 40 characters explaining your proposed solution."
	},
	experience: {
		required: "Please describe your relevant experience.",
		invalid: "Share at least 30 characters about your experience."
	},
	portfolio: {
		required: "Please share a portfolio or project link.",
		invalid: "Enter a valid URL that starts with http:// or https://."
	},
	consent: {
		required: "You must confirm your information before submitting.",
		invalid: "You must confirm your information before submitting."
	},
	skills: {
		required: "Please select at least one core skill.",
		invalid: "Please select at least one core skill."
	}
};

const textHasMinimumLength = (value, minLength = MIN_TEXT_LENGTH) => {
	return value.trim().length >= minLength;
};

const isValidEmail = (value) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value.trim());
};

const isValidPhone = (value) => {
	const digits = value.replace(/\D/g, "");
	return digits.length >= 7;
};

const isValidUrl = (value) => {
	try {
		const url = new URL(value.trim());
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
};

const setFieldError = (input, message) => {
	const errorElement = document.getElementById(`${input.id}-error`);
	if (!errorElement) {
		return;
	}

	if (message) {
		input.classList.add("border-red-500", "bg-red-50");
		input.classList.remove("border-slate-300");
		input.setAttribute("aria-invalid", "true");
		errorElement.textContent = message;
		errorElement.classList.remove("hidden");
	} else {
		input.classList.remove("border-red-500", "bg-red-50");
		input.classList.add("border-slate-300");
		input.removeAttribute("aria-invalid");
		errorElement.textContent = "";
		errorElement.classList.add("hidden");
	}
};

const setGroupError = (elementId, message) => {
	const element = document.getElementById(elementId);
	if (!element) {
		return;
	}

	if (message) {
		element.textContent = message;
		element.classList.remove("hidden");
	} else {
		element.textContent = "";
		element.classList.add("hidden");
	}
};

const validateField = (input) => {
	const fieldName = input.name;
	const fieldMessages = FIELD_MESSAGES[fieldName];

	if (!fieldMessages) {
		return true;
	}

	const value = input.value.trim();

	if (fieldName === "consent") {
		const valid = input.checked;
		setFieldError(input, valid ? "" : fieldMessages.required);
		return valid;
	}

	if (!value) {
		setFieldError(input, fieldMessages.required);
		return false;
	}

	let valid = true;

	switch (fieldName) {
		case "firstName":
		case "lastName":
		case "city":
			valid = textHasMinimumLength(value);
			break;
		case "email":
			valid = isValidEmail(value);
			break;
		case "phone":
			valid = isValidPhone(value);
			break;
		case "availability": {
			const hours = Number.parseInt(value, 10);
			valid = Number.isInteger(hours) && hours >= 5 && hours <= 60;
			break;
		}
		case "challenge":
			valid = textHasMinimumLength(value, 40);
			break;
		case "experience":
			valid = textHasMinimumLength(value, 30);
			break;
		case "portfolio":
			valid = isValidUrl(value);
			break;
		default:
			valid = true;
	}

	setFieldError(input, valid ? "" : fieldMessages.invalid);
	return valid;
};

const validateSkills = (form) => {
	const selected = form.querySelectorAll('input[name="skills"]:checked').length;
	const valid = selected > 0;
	setGroupError("skills-error", valid ? "" : FIELD_MESSAGES.skills.required);
	return valid;
};

const clearGlobalFeedback = (feedbackElement) => {
	feedbackElement.textContent = "";
	feedbackElement.classList.add("hidden");
};

const setGlobalFeedback = (feedbackElement, message) => {
	feedbackElement.textContent = message;
	feedbackElement.classList.remove("hidden");
};

const initApplicationValidation = () => {
	const form = document.getElementById("application-form");
	const globalFeedback = document.getElementById("form-global-feedback");
	const successMessage = document.getElementById("form-success");

	if (!form || !globalFeedback || !successMessage) {
		return;
	}

	const trackedInputs = [
		...form.querySelectorAll("input, select, textarea")
	].filter((input) => input.name && input.name !== "skills");

	trackedInputs.forEach((input) => {
		const eventName = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
		input.addEventListener(eventName, () => {
			validateField(input);
			clearGlobalFeedback(globalFeedback);
			successMessage.classList.add("hidden");
		});

		input.addEventListener("blur", () => {
			validateField(input);
		});
	});

	form.querySelectorAll('input[name="skills"]').forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			validateSkills(form);
			clearGlobalFeedback(globalFeedback);
			successMessage.classList.add("hidden");
		});
	});

	form.addEventListener("submit", (event) => {
		event.preventDefault();

		clearGlobalFeedback(globalFeedback);
		successMessage.classList.add("hidden");

		const fieldsValid = trackedInputs.map((input) => validateField(input));
		const skillsValid = validateSkills(form);
		const isFormValid = fieldsValid.every(Boolean) && skillsValid;

		if (!isFormValid) {
			setGlobalFeedback(globalFeedback, "Please fix the highlighted fields before submitting your application.");
			const firstInvalid = form.querySelector("[aria-invalid='true']") || form.querySelector('input[name="skills"]:not(:checked)');
			if (firstInvalid) {
				firstInvalid.focus();
			}
			return;
		}

		successMessage.textContent = "Application submitted successfully. This is a demo flow, so no data has been sent yet.";
		successMessage.classList.remove("hidden");
		form.reset();

		trackedInputs.forEach((input) => {
			setFieldError(input, "");
		});
		setGroupError("skills-error", "");
	});

	form.addEventListener("reset", () => {
		// Wait for native reset to finish before clearing validation state.
		requestAnimationFrame(() => {
			clearGlobalFeedback(globalFeedback);
			successMessage.textContent = "";
			successMessage.classList.add("hidden");

			trackedInputs.forEach((input) => {
				setFieldError(input, "");
			});

			setGroupError("skills-error", "");
		});
	});
};

document.addEventListener("DOMContentLoaded", initApplicationValidation);
