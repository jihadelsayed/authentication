import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class SignUpComponent implements OnInit {
  user: any = {
    first_name: '',
    username: '',
    email: '',
    phone: '',
    password1: '',
    password2: '',
    smsConsent: false,
    account_type: ''
  };

  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  language: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resetForm();
    this.route.queryParams.subscribe((params: any) => {
      this.host = params['host'] ?? null;
      this.port = params['port'] ?? '443';
      this.pathname = params['pathname'] ?? '';
      this.language = params['language'] ?? 'en';
    });
  }

  resetForm(form?: NgForm) {
    if (form) form.reset();

    this.user = {
      first_name: '',
      username: '',
      email: '',
      phone: '',
      password1: '',
      password2: '',
      smsConsent: false,
      account_type: ''
    };
  }

  OnSubmit(form: NgForm) {
    if (this.user.password1 !== this.user.password2) {
      // You could add a toast or message for "Passwords do not match"
      return;
    }

    if (!this.user.smsConsent || !this.user.account_type) {
      // Handle checkbox/account_type error if not already displayed
      return;
    }

    this.userService.registerUser(form.value).subscribe(
      (data: any) => {
        if (data.Succeeded === true) {
          localStorage.setItem('UserInfo', JSON.stringify(data.user));
          localStorage.setItem('userToken', data.token);

          const redirectHost = this.host ?? 'neetechs.com';
          const redirectPort = this.port ?? '443';
          const redirectLang = (this.language ?? 'en').slice(0, 2);
          const redirectPath = this.pathname ?? '';

          const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;
          window.location.href = finalRedirect;
        } else {
          // Handle failed registration (e.g., show a toast)
        }
      },
      (error) => {
        let msg: any = 'Unknown error';
        if (error.status === 400) {
          if (error.error['email']) msg = error.error['email'];
          if (error.error['first_name']) msg = error.error['first_name'];
          if (error.error['password1']) msg = error.error['password1'];
          if (error.error['password2']) msg = error.error['password2'];
          if (error.error['non_field_errors']) msg = error.error['non_field_errors'];
        } else {
          msg = error.message;
        }
        console.error(msg);
      }
    );
  }
}
