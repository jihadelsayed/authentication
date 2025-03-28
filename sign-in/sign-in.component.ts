import { Component, OnInit } from "@angular/core";
import { FormControl, FormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { UserService } from "../services/user.service";
import { CookieService } from "ngx-cookie-service";
import { CommonModule } from "@angular/common";
//import { MatSnackBar } from '@angular/material/snack-bar';
import { Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    RouterModule, // Required for ActivatedRoute, Router
  ],
  providers: [
    CookieService,
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  hide = true;
  email = new FormControl("", [Validators.required, Validators.email]);
  getErrorMessage() {
    if (this.email.hasError("required")) {
      return "you must write the e-post";
    }
    return this.email.hasError("email") ? "Not a valid email" : "";
  }
  isLoginError: boolean = false;
  loginErrorMessage: string = "";

  constructor(
    //private subcategorieService:SubCategoriService,private categoreService:CategoriService,
    @Inject(PLATFORM_ID) private platformId: Object,

    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cookie: CookieService
  ) //,private _snackBar: MatSnackBar
  {}
  host: any | null;
  language: any;
  pathname: any;
  port: any | 0;
  userToken: any = null;
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.userToken = localStorage.getItem('userToken') || null;
  
    console.log("Origin is either localhost or a real domain.");
    } else {
    this.route.queryParams
      .subscribe((params: any) => {
        console.log(params); // { order: "popular" }

        this.host = params['host'];
        this.language = params['language'];
        this.pathname = params['pathname'];
        this.port = params['port'];
        if (this.userToken != null) {
          if (this.host != null) {
            // i will send it to verify token page in the other domain
            window.location.replace(
              "http://" + this.host || 'neetechs.com'
              +':'+ this.port || '80'
              + "#/" + this.language.slice(0, 2) || 'en'
              + "/" + this.pathname || ''
              //+ "?"+ "host="+ window.location.host+"&"+"language="+ window.navigator.language +"&" + "pathname="+window.location.pathname;

            )
          } else {
            const ho = window.location.hostname
            window.location.replace(
              "http://" + ho.substring(ho.lastIndexOf(".", ho.lastIndexOf(".") - 1) + 1) || 'neetechs.com'
              +':'+ this.port || '80'
              )
          }
        }
      }
      );

  }

  }

  OnSubmit(email: any, password: any) {
    this.userService.userAuthentication(email, password).subscribe((data: any) => {
      localStorage.setItem('userToken', data.token);
      this.cookie.set('userToken', data.token);
      const body: any = {
        email: data.user.email,
        first_name: data.user.first_name,
        phone: data.user.phone,
        rating: data.user.rating,
        followers: data.user.followers,
        profession: data.user.profession,
        location: data.user.location,
        member_since: data.user.member_since,
        picture: data.user.picture,
        city: data.user.city,
        state: data.user.state,
        country: data.user.country,
        date_of_birth: data.user.date_of_birth,
        about: data.user.about,
        Facebook_link: data.user.Facebook_link,
        Linkdin_link: data.user.Linkdin_link,
        username: data.user.username,
        site_id: data.user.site_id,
        profile_completed: data.user.profile_completed,
      }

      console.log(body)
      localStorage.setItem('UserInfo', JSON.stringify(data.user));
      this.cookie.set('UserInfo', JSON.stringify(data.user));
      if (this.host != null) {
        // i will send it to verify token page in the other domain
        window.location.replace(
          "http://" + this.host || 'neetechs.com'
          +':'+ this.port || '80'
          + "#/" + this.language.slice(0, 2) || 'en'
          + "/" + this.pathname || ''
          //+ "?"+ "host="+ window.location.host+"&"+"language="+ window.navigator.language +"&" + "pathname="+window.location.pathname;

        )
      } else {
        const ho = window.location.hostname
        window.location.replace(
          "http://" + ho.substring(ho.lastIndexOf(".", ho.lastIndexOf(".") - 1) + 1) || 'neetechs.com'
          +':'+ this.port || '80'
          )
      }
    }
      , error => {
        this.isLoginError = true;

        let msg: any = "unknown error"
        if (error.status === 400) {
          if (error.error['email']) {
            msg = error.error['email']
          }
          if (error.error['password']) {
            msg = error.error['password']
          }
          if (error.error['non_field_errors']) {
            msg = error.error['non_field_errors']
          }
        } else {
          msg = error.message
        }
        this.loginErrorMessage = msg; // Set the specific error message

        // this._snackBar.open(
        //   msg
        // , "Ok",
        // {
        //   duration: 5000,
        //   verticalPosition: 'bottom',
        //   panelClass: 'warning',
        // });
      }

    );
  }
  changeLanguage(language: any) {
    localStorage.setItem('currentLanguage', language);
  }
}
