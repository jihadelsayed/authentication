import { isPlatformBrowser } from "@angular/common";
import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-get-credential",
  templateUrl: "./get-credential.component.html",
  styleUrls: ["./get-credential.component.scss"],
})
export class GetCredentialComponent implements OnInit {
  host!: string;
  language!: string;
  pathname!: string;
  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
userToken: string | null = null;
userInfo: string | null = null;

ngOnInit() {
  if (!isPlatformBrowser(this.platformId)) return;

  this.userToken = localStorage.getItem("userToken");
  this.userInfo = localStorage.getItem("UserInfo");

  this.route.queryParams.subscribe((params) => {
    this.host = params["host"];
    this.language = params["language"];
    this.pathname = params["pathname"];

    console.log("GET CREDENTIAL PARAMS:", { host: this.host, language: this.language, pathname: this.pathname });

    if (this.userToken && this.host) {
      // ✅ Set cookies
      document.cookie = `userToken=${this.userToken}; domain=.neetechs.com; path=/; Secure; SameSite=None`;
      document.cookie = `UserInfo=${this.userInfo}; domain=.neetechs.com; path=/; Secure; SameSite=None`;

      // ✅ Send credential back to parent
      window.top?.postMessage(
        {
          type: "credential",
          getToken: this.userToken,
          getUserInfo: this.userInfo,
        },
        this.host
      );
    } else if (this.host) {
      // ❌ No userToken → notify parent to show login modal
      window.top?.postMessage(
        {
          type: "login_required"
        },
        this.host
      );
    }
  });
}

}
