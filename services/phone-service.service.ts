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

  sendVerificationCode(
    selectedCountry: string,
    phone: string,
    onSuccess: () => void
  ) {
    const fullPhone = this.getFullPhoneNumber(selectedCountry, phone);
    const headers = new HttpHeaders({
      "X-Device-ID": this.deviceIdService.getOrGenerateDeviceId(),
    });

    this.http
      .post(
        this.config.serverUrl + "auth/otp/send/",
        { phone: fullPhone },
        { headers }
      )
      .subscribe({
        next: () => onSuccess(),
        error: (err) => console.error("OTP send failed", err),
      });
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
