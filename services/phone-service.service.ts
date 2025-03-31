// phone.service.ts
import { Injectable } from "@angular/core";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Observable } from "rxjs/internal/Observable";

@Injectable({ providedIn: "root" })
export class PhoneService {
  countries = [
    { code: "US", dialCode: "1", flag: "🇺🇸" },
    { code: "AE", dialCode: "971", flag: "🇦🇪" },
    { code: "SY", dialCode: "963", flag: "🇸🇾" },
    { code: "GB", dialCode: "44", flag: "🇬🇧" },
  ];
  phoneVerificationCode: string = "";
  phoneVerificationError: string = "";
  generatedCode: string = "";

  isValidPhone(phone: string): boolean {
    try {
      const parsed = parsePhoneNumberFromString(phone, "US");
      return parsed?.isValid() ?? false;
    } catch {
      return false;
    }
  }

  getFullPhoneNumber(countryCode: string, phone: string): string {
    const country = this.countries.find((c) => c.code === countryCode);
    if (!country || !phone) return "";
    return `+${country.dialCode}${phone.replace(/\D/g, "")}`;
  }
 // If you want to unify phone verification or other user-related tasks:
//  sendVerificationCode(phone: string): Observable<any> {
//   return this.http.post("/api/send-verification/", { phone });
// }

sendVerificationCode(selectedCountry: string, phone: string, onSuccess: () => void) {
  //if (!phone) {
 
  this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Send SMS to ${this.getFullPhoneNumber(selectedCountry, phone)}: Your Neetechs code is ${this.generatedCode}`);

//}
  onSuccess(); // callback from component
  //   POST /api/send-verification/
  // {
  //   phone: "+11234567890"
  // }
}

 

  verifyCode(onSuccess: () => void) {
    if (this.phoneVerificationCode === this.generatedCode) {
      onSuccess();
      
      this.phoneVerificationError = "";
    } else {
      this.phoneVerificationError =
        "Invalid verification code. Please try again.";
    }
  }
}
