import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { UserService } from "../services/user.service";
import { CookieService } from "ngx-cookie-service";
import parsePhoneNumberFromString from "libphonenumber-js";
import { PhoneService } from "../services/phone-service.service";
import { PasswordService } from "../services/password-service.service";

import {
  startRegistration,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import { DeviceIdService } from "../services/device-id.service";
import { WebAuthnService } from "../services/webauthn.service";

@Component({
  selector: "app-sign-in",
  standalone: true,
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ✅ <-- Add this
    RouterModule,
  ],
  providers: [CookieService],
})
export class SignInComponent implements OnInit {
  resendCooldown = 60;
  resendTimer: any;
  canResend = true;
  startCooldown(seconds: number = 60) {
    this.canResend = false;
    this.resendCooldown = seconds;
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        this.canResend = true;
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  loginUser: any = {
    email: "",
    phone: "",
    password: "",
  };

  loginStep: number = 1;
  loginUseEmail: boolean = false;
  loginLoading: boolean = false;
  loginError: string = "";
  showPassword: boolean = false;
  phoneTouched: boolean = false;
  selectedCountry: string = "US";
  language: string = "en";
  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cookie: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public phoneService: PhoneService,
    public passwordService: PasswordService,
    private webauthnService: WebAuthnService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params:any) => {
      this.host = params["host"] ?? null;
      this.port = params["port"] ?? "443";
      this.pathname = params["pathname"] ?? "";
      this.language = params["language"] ?? "en";
    });
  }

  nextLoginStep(): void {
    if (this.isLoginStep1Valid()) {
      this.loginStep = 2;
    }
  }

  isLoginStep1Valid(): boolean {
    if (this.loginUseEmail) {
      return !!this.loginUser.email && this.isValidEmail(this.loginUser.email);
    } else {
      const fullPhone = this.phoneService.getFullPhoneNumber(
        this.selectedCountry,
        this.loginUser.phone
      );

      return (
        !!this.loginUser.phone && this.phoneService.isValidPhone(fullPhone)
      );
    }
  }

onLoginSubmit(form: NgForm): void {
  if (!form.valid) return;

  // figure out which field to send
  let payload: any;
  if (this.loginUseEmail) {
    payload = {
      email: this.loginUser.email,
      password: this.loginUser.password,
    };
  } else {
    payload = {
      phone: this.phoneService.getFullPhoneNumber(
        this.selectedCountry,
        this.loginUser.phone
      ),
      password: this.loginUser.password,
    };
  }

  this.loginLoading = true;

  this.userService.userAuthentication(payload).subscribe(
    (data: any) => {
      // store user info
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("UserInfo", JSON.stringify(data.user));
      this.cookie.set("userToken", data.token);
      this.cookie.set("UserInfo", JSON.stringify(data.user));

      // build redirect URL
      const redirectHost = this.host ?? "neetechs.com";
      const redirectPort = this.port ?? "443";
      const redirectLang = (this.language ?? "en").slice(0, 2);
      const redirectPath = this.pathname ?? "";
      const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;

      window.location.href = finalRedirect;
      this.loginLoading = false;
    },
    (error: any) => {
      this.loginLoading = false;
      let msg: string = "Login failed";

      if (error.status === 400) {
        if (error.error["non_field_errors"])
          msg = error.error["non_field_errors"];
        else if (error.error["email"]) msg = error.error["email"];
        else if (error.error["phone"]) msg = error.error["phone"];
        else if (error.error["password"]) msg = error.error["password"];
      } else {
        msg = error.message;
      }

      this.loginError = msg;
    }
  );
}


  // promptToSavePasskey(user: any) {
  //   if (!browserSupportsWebAuthn()) return;

  //   const confirmSave = window.confirm("Do you want to enable passkey login for faster access?");
  //   if (!confirmSave) return;

  //     startRegistration({ optionsJSON })
  //       .then((cred) => {
  //     // 🔥 Send `cred` to your Django backend to save

  //   }).catch(err => {
  //     console.error("Passkey registration failed", err);
  //   });
  // }

  loginWithBiometric() {
    const userId = JSON.parse(localStorage.getItem("UserInfo") || "{}").id;
    this.webauthnService
      .login(userId)
      .then((res) => {
        localStorage.setItem("userToken", res.token);
        this.router.navigate(["/dashboard"]);
      })
      .catch((err) => {
        console.error("Biometric login failed", err);
      });
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  isValidPhone(phone: string): boolean {
    return this.phoneService.isValidPhone(phone);
  }
  getFullPhoneNumber(): string {
    return this.phoneService.getFullPhoneNumber(
      this.selectedCountry,
      this.loginUser.phone
    );
  }
  loginWithGoogle() {
    const url = "https://neetechs.com/auth/google/?process=login";
    window.location.href = url;
  }
  loginWithFacebook() {
    const url = "https://neetechs.com/auth/facebook/?process=login";
    window.location.href = url;
  }
  sendLoginOtp() {
    this.phoneService.sendVerificationCode(
      this.selectedCountry,
      this.loginUser.phone,
      () => {
        this.loginStep = 1.5; // OTP input screen
        this.startCooldown();
      }
    );
  }

  verifyLoginOtp() {
    this.phoneService.verifyCode(
      this.selectedCountry,
      this.loginUser.phone,
      this.phoneService.phoneVerificationCode,
      (hasPassword) => {
        const redirectHost = this.host ?? "neetechs.com";
        const redirectPort = this.port ?? "443";
        const redirectLang = (this.language ?? "en").slice(0, 2);
        const redirectPath = this.pathname ?? "";
        const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;
        window.location.href = finalRedirect;
      }
    );
  }
}
