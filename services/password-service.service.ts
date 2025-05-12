import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PasswordService {
  evaluatePasswordStrength(password: string): {
    percent: number;
    label: string;
    strengthClass: string;
  } {
    if (typeof password !== 'string' || !password) {
      return { percent: 0, label: "", strengthClass: "" };
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Za-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;


    // You can customize these however you like:
    const strengthMap = [
      { percent: 25, label: "Weak", strengthClass: "weak" },
      { percent: 50, label: "Moderate", strengthClass: "moderate" },
      { percent: 75, label: "Strong", strengthClass: "strong" },
      { percent: 100, label: "Very Strong", strengthClass: "very-strong" },
    ];

    const result = strengthMap[score - 1] || strengthMap[0];
    return {
      percent: result.percent,
      label: result.label,
      strengthClass: result.strengthClass,
    };
  }
}
