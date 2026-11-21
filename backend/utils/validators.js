
// 1. Validate Name (20–60 characters)
const validateName = (name) => {
    if (!name || name.trim().length < 20 || name.trim().length > 60) {
        return false;
    }
    return true;
};

// 2. Validate Email
const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
};

// 3. Validate Password (8–16 characters)
const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);
    const validLength = password.length >= 8 && password.length <= 16;

    return validLength && hasUppercase && hasSpecialCharacter;
};

// 4. Validate Address (maximum 400 characters)
const validateAddress = (address) => {
    if (address && address.length > 400) {
        return false;
    }
    return true;
};

// Export all validation functions
module.exports = {
    validateName,
    validateEmail,
    validatePassword,
    validateAddress
};
