import { Component } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

declare var google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{

  constructor(private http: HttpClient,private sanitizer:DomSanitizer){}

  jwtToken = null; 

  imageFile = null;

  imageSrc = null

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: "",
      callback: (response: any) => this.handleGoogleSignIn(response)
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { size: "large", type: "icon", shape: "pill" }  // customization attributes
    );
  }

  handleGoogleSignIn(response: any) {

    // This next is for decoding the idToken to an object if you want to see the details.
    let base64Url = response.credential.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    console.log(jsonPayload);
    const headers = { 'access-control-allow-origin': "*",'Content-Type': 'application/json; charset=utf-8' };
    const body = { googleToken: response.credential }
    this.http.post<any>('http://localhost:8443/api/auth/google', JSON.stringify(body), {headers}).subscribe(data => {
      console.log(data);
  });
  }
  
  load_image(event: Event){
    var eventTarget = (event.target as HTMLInputElement);
    if(eventTarget){
      this.imageFile = eventTarget.files[0];
      var fr = new FileReader();
      fr.onload = this._handleReader.bind(this);
      fr.readAsDataURL(eventTarget.files[0]);
    }
  }
  test(){
    //var formData = new FormData();
    //formData.append("image", this.imageFile);
    const jsonStr = JSON.stringify({
      "id": null,
      "email": "kostas",
      "password": "12345",
      "firstName": "kostas",
      "lastName": "kostas",
      "age": 15,
      "roles": ["ADMIN","USER"],
      "reservations":null,
      "performance":null,
      "image": this.imageFile            
    });
    //formData.append('appUser', new Blob([jsonStr],{type: 'application/json'}));
    const headers = { 'access-control-allow-origin': "*","Content-Type":'application/json'};
    this.http.post<any>('http://localhost:8443/api/auth/register', jsonStr, {headers}).subscribe(data => {
      console.log(data);
      var fileURL = URL.createObjectURL(new Blob([data.image], {type: "image/jpeg;base64"}));
      this.imageSrc = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' 
                 + data.image.split(",")[1]);
    })
  }
  _handleReader(readerEvent){
    this.imageFile = readerEvent.target.result;
    console.log(this.imageFile);
  }
}