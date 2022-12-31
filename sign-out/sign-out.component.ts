import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  host: any
  pathname: any
  language: any
  ngOnInit(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('UserInfo');
    //this.router.navigate(['/login']);

    this.route.queryParams
      .subscribe((params: { [x: string]: string; }) => {
        console.log(params); // { order: "popular" }
        this.host = params['host'];
        this.pathname = params['pathname'];
        this.language = params['language'];
      }
    );
    if (localStorage.getItem('userToken') != null){
      if (this.host != undefined){
        // i will send it to verify token page in the other domain
        window.location.href = "https://"+ this.host+'/#/'+ this.language + + this.pathname //+"?"+ "host="+ window.location.host+"&"+"language="+ window.navigator.language +"&" + "pathname="+window.location.pathname;
      }else{
        console.log(this.route.queryParams)
      }
    }
  }

}
