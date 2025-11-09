// packages/server/src/utils/validation.ts

export const isValiEmail = (email: string): string | null => {
    if (typeof email !== "string") {
        return "Invalid email format";
    }
    // ... (all your existing validation logic) ...
    const atIndex = email.indexOf("@");
    const lastDotIndex = email.lastIndexOf(".");
    let hasAtSgn = false;
    let validCharsBeforeAt = false;
    let hasDot = false;
    let validCharsBetweenAtAndDot = false;
    let validCharactersAfterDot = false;
    if (atIndex >= 0) {
        hasAtSgn = true;
    }
    if (atIndex > 0) {
        validCharsBeforeAt = true;
    }
    if (lastDotIndex >= 0 && lastDotIndex > atIndex) {
        hasDot = true;
    }
    if (lastDotIndex > atIndex + 1) {
        validCharsBetweenAtAndDot = true;
    }
    if (lastDotIndex < email.length - 1) {
        validCharactersAfterDot = true;
    }
    if (!hasAtSgn)
        return "Email must contain '@' symbol and it cannot be the first character.";
    if (!validCharsBeforeAt)
        return "Email must contain valid characters before '@'.";
    if (!hasDot) return "Email must contain '.' after '@'.";
    if (!validCharsBetweenAtAndDot)
        return "Email must contain valid characters between '@' and '.'.";
    if (!validCharactersAfterDot)
        return "Email must have valid characters after the last '.'.";
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    // ... (all your existing validation logic) ...
    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumber = false;
    let hasSymbol = false;
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        if (!char) {
            continue;
        }
        if (char >= "A" && char <= "Z") {
            hasUppercase = true;
        } else if (char >= "a" && char <= "z") {
            hasLowercase = true;
        } else if (char >= "0" && char <= "9") {
            hasNumber = true;
        } else if (symbols.includes(char)) {
            hasSymbol = true;
        }
    }
    if (!hasUppercase) return "Password must contain an uppercase letter.";
    if (!hasLowercase) return "Password must contain a lowercase letter.";
    if (!hasNumber) return "Password must contain a number.";
    if (!hasSymbol) return "Password must contain a symbol.";
    return null;
};
