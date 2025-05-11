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
  userToken: any = null;
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe((params) => {
        console.log(params); // { order: "popular" }

        this.host = params["host"];
        this.language = params["language"];
        this.pathname = params["pathname"];
        if (localStorage.getItem("userToken") != null) {
          if (this.host != undefined) {
            // ✅ Set cookies for all subdomains before messaging
            document.cookie = `userToken=${localStorage.getItem("userToken")}; domain=.neetechs.com; path=/; Secure; SameSite=None`;
            document.cookie = `UserInfo=${localStorage.getItem("UserInfo")}; domain=.neetechs.com; path=/; Secure; SameSite=None`;

            const topWindow: any = window.top;
            topWindow.postMessage(
              {
                type: "credential",
                getToken: localStorage.getItem("userToken"),
                getUserInfo: localStorage.getItem("UserInfo"),
              },
              this.host
            );
          }
        }


        //console.log(this.route.queryParams)
      });
    }
  }
}
