import { Component, OnInit } from "@angular/core";
import { NgForm, FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserService } from "../services/user.service";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PhoneService } from "../services/phone-service.service";
import { PasswordService } from "../services/password-service.service";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SignUpComponent implements OnInit {
  selectedCountry: string = "US";
  passwordMismatch: boolean = false;

  passwordStrength = { percent: 0, label: '', strengthClass: '' };

  strengthClass: string = "";
  user: any = {
    first_name: "",
    username: "",
    email: "",
    phone: "",
    password1: "",
    password2: "",
    smsConsent: false, //,
    //account_type: ''
  };
  phoneTouched: boolean = false;

  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  language: string | null = null;
  showReferral: boolean = false;
  useEmail: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public phoneService: PhoneService,
    public passwordService: PasswordService
  ) {}
  private intervalId: any;

  ngOnInit(): void {
    this.resetForm();
    // Watch password changes
    // this.intervalId = setInterval(() => {
    //   if (this.user.password1 !== "") {
    //     console.log("jihad");
    //     this.evaluatePasswordStrength(this.user.password1);
    //   }
    // }, 1000);
  

    this.route.queryParams.subscribe((params: any) => {
      this.host = params["host"] ?? null;
      this.port = params["port"] ?? "443";
      this.pathname = params["pathname"] ?? "";
      this.language = params["language"] ?? "en";
    });

 
  }
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  verifyCode() {
    this.phoneService.verifyCode(() => {
      this.step = 2;
    });
  }

  resetForm(form?: NgForm) {
    if (form) form.reset();

    this.user = {
      first_name: "",
      username: "",
      email: "",
      phone: "",
      password1: "",
      password2: "",
      smsConsent: false, // ,
      // account_type: ''
    };

    this.useEmail = false;
    this.showPassword = false;
    this.loading = false;
  }
  step: number = 1;

  nextStep() {
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  stepLoading: boolean = false;

  nextStepWithSpinner() {
    this.stepLoading = true;

    setTimeout(() => {
      if (this.step === 1 && !this.useEmail) {
        this.phoneService.sendVerificationCode(this.selectedCountry, this.user.phone, () => {
          this.step = 1.5;
        });
      } else {
        this.step++;
      }

      this.stepLoading = false;
    }, 400);
  }

  prevStepWithSpinner() {
    this.stepLoading = true;
    setTimeout(() => {
      this.step--;
      this.stepLoading = false;
    }, 400);
  }

  OnSubmit(form: NgForm) {
    this.passwordMismatch = this.user.password1 !== this.user.password2;

    if (this.passwordMismatch) {
      return;
    }
    if (this.passwordStrength.percent < 50) {
      console.error("Password too weak.");
      this.passwordStrength.label =
        "Password too weak (must be at least Moderate)";
      this.strengthClass = "weak";
      return;
    }
    // if (!this.user.smsConsent || !this.user.account_type) {
    //   console.error('Missing required fields.');
    //   return;
    // }

    this.loading = true;

    if (!this.user.smsConsent) {
      console.error("Missing required fields.");
      return;
    }

    this.loading = true;

    this.userService.registerUser(form.value).subscribe(
      (data: any) => {
        this.loading = false;

        if (data.Succeeded === true) {
          localStorage.setItem("UserInfo", JSON.stringify(data.user));
          localStorage.setItem("userToken", data.token);

          const redirectHost = this.host ?? "neetechs.com";
          const redirectPort = this.port ?? "443";
          const redirectLang = (this.language ?? "en").slice(0, 2);
          const redirectPath = this.pathname ?? "";
          const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;

          window.location.href = finalRedirect;
        } else {
          console.error("Registration failed:", data);
        }
      },
      (error) => {
        this.loading = false;
      
        let msg: any = "Unknown error";
        if (error.status === 400) {
          if (error.error["email"]) msg = error.error["email"];
          if (error.error["first_name"]) msg = error.error["first_name"];
          if (error.error["password1"]) msg = error.error["password1"];
          if (error.error["password2"]) msg = error.error["password2"];
          if (error.error["non_field_errors"]) {
            msg = error.error["non_field_errors"];
          }
        } else {
          msg = error.message || "Unknown error";
        }
        console.error(`${msg}`); // ensures it's a string
      }
      
    );
  }
  isStep1Valid(): boolean {
    if (this.useEmail) {
      return !!this.user.email && this.isValidEmail(this.user.email);
    } else {
      return (
        !!this.user.phone &&
        this.phoneService.isValidPhone(this.user.phone) &&
        this.user.smsConsent
      );
    }
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  evaluatePasswordStrength(password: string) {
    const result = this.passwordService.evaluatePasswordStrength(password);
    this.passwordStrength.percent = result.percent;
    this.passwordStrength.label = result.label;
    this.strengthClass = result.strengthClass;
  }
}
