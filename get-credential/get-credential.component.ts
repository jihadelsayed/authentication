import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-get-credential',
  templateUrl: './get-credential.component.html',
  styleUrls: ['./get-credential.component.scss']
})
export class GetCredentialComponent implements OnInit {
  host!: string;
  language!: string;
  pathname!: string;
  constructor(private route: ActivatedRoute) {}
  userToken:any = localStorage.getItem('userToken') || null
  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {

        console.log(params); // { order: "popular" }

        this.host = params['host'];
        this.language = params['language'];
        this.pathname = params['pathname'];
        if (localStorage.getItem('userToken') != null){
          if (this.host != undefined){
            const topWindow:any = window.top;

            topWindow.postMessage({
              type:"credential",
              getToken: localStorage.getItem("userToken"),
              getUserInfo: localStorage.getItem("UserInfo")
            } // get it from url
            , this.host)
            // i will send it to verify token page in the other domain

          }else{
          }
        }

        //console.log(this.route.queryParams)
      }
    );



  }



}
