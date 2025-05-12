// phone.service.ts
import { Injectable } from "@angular/core";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Observable } from "rxjs/internal/Observable";
import { DeviceIdService } from "./device-id.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RuntimeConfigService } from "../../services/runtime-config.service";

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
  constructor(
    private http: HttpClient,
    private deviceIdService: DeviceIdService,
    private config: RuntimeConfigService
  ) {} // ✅

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
  // Instead of generating mock OTP here, just call your backend
  const fullPhone = this.getFullPhoneNumber(selectedCountry, phone);
  fetch('https://api.neetechs.com/auth/otp/send/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-ID': localStorage.getItem('device_id') || '', // optional
    },
    body: JSON.stringify({ phone: fullPhone }),
  })
    .then(res => res.json())
    .then(() => onSuccess())
    .catch(err => console.error("Failed to send OTP:", err));
}

verifyCode(selectedCountry: string, phone: string, otp: string, onSuccess: () => void) {
  const fullPhone = this.getFullPhoneNumber(selectedCountry, phone);
  fetch(this.config.serverUrl + 'auth/otp/verify/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-ID': localStorage.getItem('device_id') || '',
    },
    body: JSON.stringify({ phone: fullPhone, otp }),
  })
    .then(res => res.json())
    .then((res) => {
      if (res.token) {
        localStorage.setItem("userToken", res.token);
        localStorage.setItem("UserInfo", JSON.stringify(res.user));
        onSuccess();
      } else {
        this.phoneVerificationError = res.detail || "Invalid OTP";
      }
    })
    .catch(err => {
      this.phoneVerificationError = "Verification failed.";
      console.error(err);
    });
}


}
