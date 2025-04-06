import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-desarrolloweb',
  templateUrl: './desarrolloweb.component.html',
  styleUrl: './desarrolloweb.component.css'
})
export class DesarrollowebComponent implements OnInit {
  ngOnInit() {
    window.scrollTo(0, 0); 
  }
}