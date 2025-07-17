// onInput field for the 
export const toInputTitleCase = (e) => {
  const input = e.target;
  let value = input.value;
  const cursorPosition = input.selectionStart; // Save the cursor position

  // Remove leading spaces
  value = value.replace(/^\s+/g, "");

  // Ensure only allowed characters (alphabets and spaces)
  const allowedCharsRegex = /^[a-zA-Z0-9\s]+$/;
  value = value
    .split("")
    .filter((char) => allowedCharsRegex.test(char))
    .join("");

  // Capitalize the first letter of each word
  const words = value.split(" ");

  // Capitalize the first letter of each word and leave the rest of the characters as they are
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      // Capitalize the first letter, keep the rest as is
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return "";
  });

  // Join the words back into a string
  let formattedValue = capitalizedWords.join(" ");

  // Remove spaces not allowed (before the first two characters)
  if (formattedValue.length > 1) {
    formattedValue =
      formattedValue.slice(0, 1) +
      formattedValue.slice(1).replace(/\s+/g, " ");
  }

  // Update input value
  input.value = formattedValue;

  // Restore the cursor position
  input.setSelectionRange(cursorPosition, cursorPosition);
};

//On Input Validation for Address/Location 
export    const toInputAddressCase = (e) => {
  const input = e.target;
  let value = input.value;
  const cursorPosition = input.selectionStart; // Save the cursor position
  // Remove leading spaces
  value = value.replace(/^\s+/g, "");
  // Ensure only alphabets (upper and lower case), numbers, and allowed special characters
  const allowedCharsRegex = /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/;
  value = value
    .split("")
    .filter((char) => allowedCharsRegex.test(char))
    .join("");

  // Capitalize the first letter of each word, but allow uppercase letters in the middle of the word
  const words = value.split(" ");
  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      // Capitalize the first letter, but leave the middle of the word intact
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return "";
  });

  // Join the words back into a string
  let formattedValue = capitalizedWords.join(" ");

  // Remove spaces not allowed (before the first two characters)
  if (formattedValue.length > 2) {
    formattedValue =
      formattedValue.slice(0, 2) +
      formattedValue.slice(2).replace(/\s+/g, " ");
  }

  // Update input value
  input.value = formattedValue;

  // Restore the cursor position
  input.setSelectionRange(cursorPosition, cursorPosition);
};

// validate companyName
export const validateCompanyName = (value) => {
  // Trim leading and trailing spaces
  const trimmedValue = value.trim();

  // Check for leading or trailing spaces
  if (/^\s/.test(value)) {
    return "Leading space not allowed."; // Leading space error
  } else if (/\s$/.test(value)) {
    return "Spaces at the end are not allowed."; // Trailing space error
  }

  // Check for multiple spaces between words
  if (/\s{2,}/.test(value)) {
    return "No Multiple Spaces Between Words Allowed.";
  }

  // Validate special characters and alphabets (including @, $, &, ())
  const validCharsRegex = /^[A-Za-z\s,.'\-/&@$()]*$/;
  if (!validCharsRegex.test(value)) {
    return "Field accepts only alphabets and special characters: ( , ' - . / & @ $ ( ) )";
  }

  // Check word lengths (min 2 characters for alphabetic words)
  const words = trimmedValue.split(" ");

  for (const word of words) {
    // Allow words that are only special characters (e.g., "-")
    if (/^[\W]+$/.test(word)) {
      continue; // Skip special characters only words
    }

    // If the word contains special characters (e.g., "dsad-@dsad"), it is valid
    // Ensure at least 2 alphabetic characters before any special characters in a word
    if (/^[A-Za-z]+[\W]*[A-Za-z]*$/.test(word)) {
      continue; // Word contains at least 2 alphabetic characters with or without special characters
    }

    // If the word is alphabetic and has less than 2 characters, show error
    if (/^[A-Za-z]+$/.test(word) && word.length < 2) {
      return "Minimum Length 2 Characters Required."; // If any alphabetic word is shorter than 2 characters
    }

    // If the word exceeds 100 characters, show error
    if (word.length > 100) {
      return "Max Length 100 Characters Exceed."; // If any word is longer than 100 characters
    }
  }

  return true; // Return true if all conditions are satisfied
};
export const validateFirstName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces e at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }

    // Ensure only alphabetic characters and spaces
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
    }

     // Ensure the first letter and every letter after a space is uppercase
     if (!/^[A-Z][A-Za-z]*([ ][A-Z][A-Za-z]*)*$/.test(trimmedValue)) {
      return "Each Word Should Start With an Uppercase Letter.";
  }

    // Check for minimum and maximum word length
    else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 1) {
          return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
        } else if (word.length > 100) {
          return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
        }
      }
      // Check if there are multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }

      // Check minimum character length after other validations
      if (trimmedValue.length < 3) {
        return "Minimum 3 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  //Validate LastName
   export const validateLastName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }

    // Ensure only alphabetic characters and spaces
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
    }

    // Check for minimum and maximum word length
    else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 1) {
          return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
        } else if (word.length > 100) {
          return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
        }
      }

      // Check if there are multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }

      // Check minimum character length after other validations
      if (trimmedValue.length < 1) {
        return "Minimum 1 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

// validate password
  export  const validatePassword = (value) => {
    const errors = [];
    if (!/(?=.*[0-9])/.test(value)) {
      errors.push("at least one digit");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("at least one uppercase letter");
    }
    if (!/(?=.*[\W_])/.test(value)) {
      errors.push("at least one special character");
    }
    if (value.includes(" ")) {
      errors.push("no spaces");
    }

    if (errors.length > 0) {
      return `Password must contain ${errors.join(", ")}.`;
    }
    return true; // Return true if all conditions are satisfied
  };

 export const validateNumber = (value) => {
    // Check if the input is empty
    if (!value || value.trim().length === 0) {
      return true;
    }

    // Check if the value contains only digits
    if (!/^\d+$/.test(value)) {
      return "Only Numeric Characters Are Allowed.";
    }

    // Check if there are any leading or trailing spaces
    if (/^\s|\s$/.test(value)) {
      return "No Leading or Trailing Spaces Are Allowed.";
    }

    // Check for multiple spaces in between numbers
    if (/\s{2,}/.test(value)) {
      return "No Multiple Spaces Between Numbers Allowed.";
    }

    // Optionally: Check if the number is composed of repeating digits
    const isRepeating = /^(\d)\1{11}$/.test(value); // Check if all digits are the same (e.g., "111111111111")
    if (isRepeating) {
      return "The Number Cannot Consist Of The Same Digit Repeated.";
    }

    return true; // Return true if all validations pass
  };
  export const validateLocation = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();
  
    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Location is Required.";
    }
    
    // Check for trailing spaces
    if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }
  
    // Check if the value contains only special characters
    const specialCharsOnly = /^[!-_@#&()*/,.\\-{}]+$/;
    const hasAlphanumeric = /[a-zA-Z0-9]/;
    if (specialCharsOnly.test(trimmedValue) && !hasAlphanumeric.test(trimmedValue)) {
      return "Location cannot contain only special characters.";
    }
  
    // Ensure only allowed characters (alphabets, numbers, spaces, and some special chars)
    if (!/^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/.test(trimmedValue)) {
      return "Invalid Format of Location.";
    }
  
    // Check for minimum and maximum word length
    const words = trimmedValue.split(" ");
    for (const word of words) {
      if (word.length < 1) {
        return "Minimum Length 1 Character Required.";
      } else if (word.length > 255) {
        return "Max Length 255 Characters Required.";
      }
    }
  
    // Check if there are multiple spaces between words
    if (/\s{2,}/.test(trimmedValue)) {
      return "No Multiple Spaces Between Words Allowed.";
    }
    if (trimmedValue.length < 3) {
      return "Minimum 3 Characters Required.";
    }
  
    return true; // Return true if all conditions are satisfied
  };

export const validateTempAddress = (value) => {
  // If the field is empty (and not required), return true (valid)
  if (!value.trim()) {
    return true; // Valid if empty, because it's not a required field
  }

  // Trim leading and trailing spaces before further validation
  const trimmedValue = value.trim();

  // Check for trailing spaces
  if (/\s$/.test(value)) {
    return "Spaces at the end are not allowed.";
  } else if (/^\s/.test(value)) {
    return "No Leading Space Allowed.";
  }

  // Check if the value contains only special characters
  const specialCharsOnly = /^[!-_@#&()*/,.\\-{}]+$/;
  const hasAlphanumeric = /[a-zA-Z0-9]/;
  if (specialCharsOnly.test(trimmedValue) && !hasAlphanumeric.test(trimmedValue)) {
    return "Temporary Address cannot contain only special characters.";
  }

  // Ensure only allowed characters (alphabets, numbers, spaces, and some special chars)
  if (!/^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/.test(trimmedValue)) {
    return "Invalid Format of Temporary Address.";
  }

  // Check for minimum and maximum word length
  const words = trimmedValue.split(" ");
  for (const word of words) {
    if (word.length < 1) {
      return "Minimum Length 1 Character Required.";
    } else if (word.length > 255) {
      return "Max Length 255 Characters Required.";
    }
  }

  // Check if there are multiple spaces between words
  if (/\s{2,}/.test(trimmedValue)) {
    return "No Multiple Spaces Between Words Allowed.";
  }
  if (trimmedValue.length < 3) {
    return "Minimum 3 Characters Required.";
  }

  return true; // Return true if all conditions are satisfied
};

  //Validate Phone Number
  export const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith("+91 ")) {
        return "Phone number must start with '+91 ' (including a single space).";
    }

    const phoneRegex = /^\+91 [6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return "Phone number must start with +91, followed by a space, and begin with a digit between 6-9, with exactly 10 digits after the space.";
    }

    const repeatedDigitRegex = /(\d)\1{9,}/;
    const numberPart = phoneNumber.split(" ")[1];

    if (repeatedDigitRegex.test(numberPart)) {
        return "Phone number cannot contain the same digit more than 9 times.";
    }

    return true; // Validation passed
};

//validate MailId
export const validateEmail = (email) => {
    if (email !== email.trim()) {
        return "Email should not have leading or trailing spaces.";
    }
    if (/\s/.test(email)) {
        return "Email should not contain any spaces.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}$/;
    
    const match = email.match(emailRegex);
    if (!match) {
        return "Invalid email format. Please enter a valid email address.";
    }

    return true;
};

// validate Aadhar number
export const validateAadhar = (aadhar) => {
    if (aadhar !== aadhar.trim()) {
        return "Aadhar number should not have leading or trailing spaces.";
    }
    if (/\s/.test(aadhar)) {
        return "Aadhar number should not contain any spaces.";
    }

    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadhar)) {
        return "Invalid Aadhar number. It must be exactly 12 digits.";
    }

    return true;
};

//validate PAN Number
export const validatePAN = (pan) => {
    if (pan !== pan.trim()) {
        return "PAN should not have leading or trailing spaces.";
    }
    if (/\s/.test(pan)) {
        return "PAN should not contain any spaces.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(pan)) {
        return "Invalid PAN number. Format should be 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g., ABCDE1234F).";
    }

    return true;
};

// validate UAN Number
export const validateUAN = (uan) => {
  if (!uan || uan.trim() === "") return true; // ✅ Allows empty values (optional field)

    if (uan !== uan.trim()) {
        return "UAN should not have leading or trailing spaces.";
    }
    if (/\s/.test(uan)) {
        return "UAN should not contain any spaces.";
    }

    const uanRegex = /^\d{12}$/;
    if (!uanRegex.test(uan)) {
        return "Invalid UAN number. It must be exactly 12 digits.";
    }

    return true;
};

// Validate PF Number
export const validatePFNumber = (pfNo) => {
  if (!pfNo || pfNo.trim() === "") return true; // ✅ Allows empty values (Optional Field)

  if (pfNo !== pfNo.trim()) {
      return "PF Number should not have leading or trailing spaces.";
  }
  if (/\s/.test(pfNo)) {
      return "PF Number should not contain any spaces.";
  }

  // ✅ PF Number Format: XX/XXX/1234567/000/1234567
  const pfRegex = /^[A-Z]{2}[A-Z]{3}\d{7}\d{3}\d{7}$/  ;

  if (!pfRegex.test(pfNo)) {
      return "Invalid PF Number format. Expected format: XX/XXX/1234567/000/1234567";
  }

  return true; // ✅ Passes validation
};


//Bank Account Number
export const validateBankAccount = (accountNumber) => {
    if (accountNumber !== accountNumber.trim()) {
        return "Bank account number should not have leading or trailing spaces.";
    }
    if (/\s/.test(accountNumber)) {
        return "Account number should not contain any spaces.";
    }

    const accountRegex = /^\d{6,18}$/;
    if (!accountRegex.test(accountNumber)) {
        return "Invalid Bank Account Number. It must be between 6 to 18 digits.";
    }

    return true;
};

//Bank IFSC Code
export const validateIFSC = (ifsc) => {
    if (ifsc !== ifsc.trim()) {
        return "IFSC code should not have leading or trailing spaces.";
    }
    if (/\s/.test(ifsc)) {
        return "IFSC Code should not contain any spaces.";
    }


    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) {
        return "Invalid IFSC Code. Format should be 4 uppercase letters, '0', and 6 alphanumeric characters (e.g., SBIN0001234).";
    }

    return true;
};

//validate Bank Branch

export const validateBankBranch =(bankBranch)=>{
    if(bankBranch !== bankBranch.trim()){
        return "No Leading and Trailing Spaces"
    }
    const bankBranchRegex=/^[a-zA-Z0-9,.-_]{2,50}$/;
    if(!bankBranchRegex.test(bankBranch)){
        return "Invalid Branch Format"
    }
    return true;
}

// utils/validations.js

// Capitalized name regex: Each word starts with capital, no trailing/leading space
const nameRegex = /^(?! )[A-Z][a-z]*(?: [A-Z][a-z]*)*$/;

// GST Number: standard 15 characters
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Year: 4 digit
const yearRegex = /^\d{4}$/;

// Month: must be word (Jan, February, etc.)
const monthRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)$/i;

// Number only fields (e.g. amount fields)
const numericRegex = /^[0-9]+$/;


export const nameValidation = {
  required: "Name is required",
  pattern: {
    value: nameRegex,
    message: "Each word should start with a capital letter, no extra spaces",
  },
  maxLength: {
    value: 60,
    message: "Name must not exceed 60 characters",
  },
};

export const gstValidation = {
  required: "GST No is required",
  pattern: {
    value: gstRegex,
    message: "Invalid GST Number format",
  },
};

export const yearValidation = {
  required: "Year is required",
  pattern: {
    value: yearRegex,
    message: "Enter a valid 4-digit year",
  },
};

export const monthValidation = {
  required: "Month is required",
  pattern: {
    value: monthRegex,
    message: "Enter a valid month (e.g. July)",
  },
};

export const invoiceNumberValidation = {
  required: "Invoice Number is required",
  maxLength: {
    value: 20,
    message: "Invoice Number should not exceed 20 characters",
  },
};

export const numberValidation = (label = "This field") => ({
  required: `${label} is required`,
  pattern: {
    value: numericRegex,
    message: `${label} must be a valid number`,
  },
  minLength: {
    value: 1,
    message: `${label} is too short`,
  },
  maxLength: {
    value: 10,
    message: `${label} must not exceed 10 digits`,
  },
});




