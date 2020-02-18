import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { ReportesManagerProvider } from '../../providers/reportes-manager/reportes-manager';
import { LoaderProvider } from '../../providers/loader/loader';
import { ReportPresentatorProvider } from '../../providers/report-presentator/report-presentator';
import { PermissionsProvider } from '../../providers/permissions/permissions';
import { DoctoresDataProvider } from '../../providers/doctores-data/doctores-data';

/**
 * Generated class for the ReportesgenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reportesgen',
  templateUrl: 'reportesgen.html',
})
export class ReportesgenPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userData: UserDataProvider,
    public viewCtrl:ViewController,
    public loader: LoaderProvider,
    public reportPresentator: ReportPresentatorProvider,
    public permissions:PermissionsProvider,
    public docData:DoctoresDataProvider
  ) {
  }

  chosenDate: string = new Date().toISOString();
  todayDate: string = new Date().toISOString();

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportesgenPage');
    //this.reportPresentator.chosenDate = new Date();
   this.todayDate = new Date().toISOString();
   this.chosenDate = this.todayDate;
  }


  dateChange(){
    console.log('chosen date changed to',this.chosenDate);
  }



  openReporte(){
    this.reportPresentator.chosenDate = new Date(this.chosenDate);
   this.reportPresentator.loadReportNM().then(()=>{
   });
  }
}
