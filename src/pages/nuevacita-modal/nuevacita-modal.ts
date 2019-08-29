import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { Citas } from '../../providers/user-data/citas';
import { Debugger } from '../../providers/user-data/debugger';
import { CitasManagerProvider } from '../../providers/citas-manager/citas-manager';
import { NotificationsManagerProvider } from '../../providers/notifications-manager/notifications-manager';
import { LoaderProvider } from '../../providers/loader/loader';
import { AlertProvider } from '../../providers/alert/alert';
import { WsMessengerProvider } from '../../providers/ws-messenger/ws-messenger';
import { DoctoresDataProvider } from '../../providers/doctores-data/doctores-data';
import { PermissionsProvider } from '../../providers/permissions/permissions';
//import * as moment from 'moment';
import { DateProvider } from '../../providers/date/date';
//import { DlDateTimePickerDateModule } from 'angular-bootstrap-datetimepicker';
import { Calendar } from '@ionic-native/calendar';
import { DoctoresManagerProvider } from '../../providers/doctores-manager/doctores-manager';
import { CitasDataProvider } from '../../providers/citas-data/citas-data';
import { SubscriptionManagerProvider } from '../../providers/subscription-manager/subscription-manager';
import { UpdaterProvider } from '../../providers/updater/updater';


/**
 * Generated class for the NuevacitaModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nuevacita-modal',
  templateUrl: 'nuevacita-modal.html',
})




export class NuevacitaModalPage {
  cita:Citas = null;
  isnew:boolean = true;
  selectedDate:string = null;

  //date: string;
  dateobj:Date;
  selectedHour:number = 0;
  selectedHourISO:string = '';
  type: 'string';

  hourstring:string = null;


date: Date;
daysInThisMonth: any;
daysInLastMonth: any;
daysInNextMonth: any;
monthNames: string[];
currentMonth: any;
currentMonthNum:any;
currentYear: any;
currentDate: any;

eventList: any;
selectedEvent: any;
isSelected: any;

hours:any[] = new Array();
hourIntervalMS:number = 30*60*1000;

showerrors:boolean = false;
  
horantr: string = '';
  formatear(evento){
    var hora = this.horantr.replace(':','');
    var arregloHora = hora.match(/.{1,2}/g) ? hora.match(/.{1,2}/g) : [];
    if(arregloHora.length == 2){
      this.horantr = arregloHora.join(':');
    }
    if(this.horantr.length > 5){
      this.horantr = this.horantr.substring(0,5);
    }
  }

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userData: UserDataProvider,
    public viewCtrl: ViewController,
    public citasMan: CitasManagerProvider,
    public notiMan: NotificationsManagerProvider,
    public loader: LoaderProvider,
    public alert: AlertProvider,
    public wsMessenger: WsMessengerProvider,
    public docData: DoctoresDataProvider,
    public docMan: DoctoresManagerProvider,
    public permissions: PermissionsProvider,
    public dateP: DateProvider,
    private calendar: Calendar,
    public citasData: CitasDataProvider,
    public subscriptionManager:SubscriptionManagerProvider,
    public updater: UpdaterProvider
  ) {
    
    /** 
     * Al entrar seteas la fecha a este momento:
     *  setear dia de hoy en calendario
     *  setear intervalo en las horas correspondiente a esta hora.
     *
     * **/
    console.log('GETTING CITA', navParams.get('cita'));
    let aux_node = navParams.get('cita');
    if(aux_node){
      this.cita = aux_node;
      Debugger.log(['cita en modal es',this.cita]);
      this.isnew = false;
      //this.selectedDate = Citas.getLocalDateIso(new Date(this.cita.data.field_datemsb['und'][0]['value']));//new Date().toISOString();
      this.selectedHourISO = Citas.getLocalDateIso(new Date(this.cita.data.field_datemsb['und'][0]['value']));//new Date().toISOString();
      this.dateobj = new Date(this.cita.data.field_datemsb['und'][0]['value']);
      let dateobj_start = new Date(this.cita.data.field_datemsb['und'][0]['value']);
      dateobj_start.setHours(0,0,0,0);
      this.selectedHour = this.dateobj.getTime() - dateobj_start.getTime();
      console.log('selected hour is:', this.selectedHour);
      console.log(this.selectedDate);
      this.setHourstring();
    }else{
      this.isnew = true;
      this.resetNewCita();
      this.cita.date = new Date();
      this.dateobj = new Date();
      this.selectedHour = 0;
   
      //this.selectedDate = Citas.getLocalDateIso(new Date());//new Date().toISOString();
      this.selectedHourISO = Citas.getLocalDateIso(this.getDateOnNextTreshold());//new Date().toISOString();
     
    }
    if(Number(this.cita.data.field_telefono.und[0].value) === 0){
      this.cita.data.field_telefono.und[0].value = null;
    }
  }

  setHours(){
  
 
    
  }

  setHourstring(){
    console.log('trailsh setHourstring start');
    
    if(!this.isnew){
      console.log('trailsh setting hours');
      let aux_date = new Date(this.cita.dateMs);
      this.horantr = `${DateProvider.formatDateBinaryNumber(aux_date.getHours())}:${DateProvider.formatDateBinaryNumber(aux_date.getMinutes())}`;
      //this.hourstring = aux_date.getHours()+':'+aux_date.getMinutes();
      //console.log('trailsh setting hours' , this.hourstring,aux_date);
    }
  }

  hourDisplay(hourMs):string{
    let ret = "";
    return DateProvider.getDisplayableHourfMS(hourMs);
  }

  checkSelectedHour(hour):boolean{
    let ret = false;
    //if(this.selectedHour >= hour && this.selectedHour < hour+(this.hourIntervalMS)) ret =  true;
    if(DateProvider.isDateBetweenNumber( this.selectedHour, hour,hour+(this.hourIntervalMS) ) ) ret = true;
    return ret;
  }



  ionViewWillEnter() {
    this.calendarLoad();
  }

  datechange($event) {
    this.cita.date = $event;
    //console.log($event);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  resetNewCita(){
    this.cita = new Citas();
  }

  ionViewDidLoad() {
    console.log('trailsh ionViewDidLoad NuevacitaModalPage');
    //console.log('ionViewWillEnter');
 
    //this.calendarLoad();
  }

  getDisplayableDates(){
    return DateProvider.getDisplayableDates( this.cita.date);
  }

  choseHourClick(hour){
    console.log(hour);
    this.selectedHour = hour;
  }

  async createCita(){
    if(!this.basicNewCitaValidation()){ return false; }
    
    if(!this.notEmptyNewCitaValidation()){ return false; } 
    this.setCitaDateFromiNPUT();
    if(!this.citaDateValidation()){ return false; }
    
    this.loader.presentLoader('creando cita...');
    this.cita.data.field_estado.und["0"].value = 0;
    if(this.userData.checkUserPermission([this.userData.TIPO_DOCTOR])){
      this.cita.data.field_cita_doctor.und[0]=this.userData.userData.uid;
  
    }
      this.cita.data.field_cita_recepcion.und[0]=this.userData.userData.uid; //esto es quien creo la cita
      this.cita.data.field_cita_caja.und[0]="_none"; //quien cobro la cita
      this.cita.caja_playerid = null;
      this.cita.data.field_servicios_cita.und = []; //limpiamos los servicios porque nos deja basura
    await this.citasMan.generateNewCita( this.cita.data ).subscribe(
    (val)=>{
      console.log(val.nid);
      this.notiMan.generateNotification([this.cita.data.field_cita_doctor.und[0]],`Nueva Cita con ${this.cita.paciente} fecha: ${new Date(this.cita.data.field_datemsb['und'][0]['value'])}`,`cita-${this.cita.Nid}`);
      this.cita.data.Nid = val.nid;
      this.cita.Nid = val.nid;
      this.wsMessenger.generateWSupdateMessage(this.cita);
    },
    response => {
        console.log("POST call in error", response);
        console.log("show error");
        for (var key in response.error.form_errors) {
          this.alert.presentAlert('Error', 'Se ha detectado un error inesperado en '+key);
        }
      }
  );
  //await this.docMan.pushDisponivilidad(this.cita.data.field_cita_doctor.und[0], this.cita.data.field_datemsb['und'][0]['value'] );
  //await this.citasMan.requestCitas().toPromise();
  this.loader.dismissLoader();
  this.close();
}

notEmptyNewCitaValidation(){
  let ret = true;
  console.log('notEmptyNewCitaValidation');
  if(!this.checkIfInputfilledNPromtp(this.cita.data.field_paciente.und[0].value,ret)) ret = false;
  //no hace falta revisar el doctor, porque ese ya esta validado.
  if(!this.checkIfInputfilledNPromtp(this.horantr,ret)) ret = false;
  return ret;
}

checkIfInputfilledNPromtp( input , actualret){
  let ret = true;
  console.log('enter');
  if(!actualret){ return false;} ;
  console.log('checkIfInputfilledNPromtp',input,input === null , input ? false : true );
  if( input ? false : true ){
    console.log('this input is not filled mf',input);
    ret = false;
    this.alert.presentAlert('Error','Revisar los campos marcados en rojo.');
    this.showerrors = true;
  }
  return ret;
}

basicNewCitaValidation(){
  let ret = true;
  if(this.cita.data.field_telefono.und[0].value === null){
    this.cita.data.field_telefono.und[0].value = 0;
  }
  

  if(this.userData.checkUserPermission([this.userData.TIPO_DOCTOR])){
  }
  else{
    if( Number(this.cita.data.field_cita_doctor.und[0]) === 0 ){
      this.alert.presentAlert('Error','Debe elegir un doctor para esta cita');
      this.showerrors = true;
      console.log('showerrors',this.showerrors);
      ret = false;
    }
  }
  return ret;
}

citaDateValidation():boolean{
  let ret = true;
  console.log('citaDateValidation',this.cita.data.field_datemsb);
  console.log('citaDateValidation',new Date(this.cita.data.field_datemsb['und'][0]['value']));
  console.log('this.hourstring',this.horantr);
  if(this.cita.data.field_datemsb['und'][0]['value'] < new Date().getTime()){
    console.log('elegir fecha a futuro.');
    this.alert.presentAlert('Error','Debe elegir una fecha a futuro');
    ret = false;
  }
  if(!DateProvider.validateHhMm(this.horantr)){
    console.log('la hora esta mal',this.horantr);
    this.alert.presentAlert('Error','Formato de hora incorrecto');
    ret = false;
  }
  return ret;
}

getDateOnNextTreshold():Date{
  let aux_date = new Date();
  if(aux_date.getMinutes()%15 !== 0){
    console.log('noes15');
    let min = 15* Math.ceil(aux_date.getMinutes()/15);
    if(min >= 60){
      aux_date.setMinutes(0);
      aux_date = new Date(aux_date.getTime() + ( 60*60*1000 ));
    }else{
      aux_date.setMinutes(min);
    }
  }else{
    console.log('es15');
  }
  return aux_date;
}

async updateCita(){
  //poner que el websocket envie la informacion al updatear cita morro >=0
  if(!this.citaDateValidation()){ return false; }
  if(this.cita.data.field_telefono.und[0].value === null){
    this.cita.data.field_telefono.und[0].value = 0;
  }
  this.setCitaDateFromiNPUT();
  this.loader.presentLoader('actualizando ...');
  await this.citasMan.updateCita( this.cita.data ).subscribe(
    (val)=>{
      this.wsMessenger.generateWSupdateMessage(this.cita);    
    },
    response => {
      console.log("POST call in error", response);
      console.log("show error");
      for (var key in response.error.form_errors) {
        this.alert.presentAlert('Error', 'Se ha detectado un error inesperado en '+key);
      }
    }
  );
  this.loader.dismissLoader();
  this.close();
}


close(){
  this.viewCtrl.dismiss();
}



setCitaDateFromiNPUT(){
  //get the timezoned input and put it on utc on this format 2018-07-04 14:30:00-07:00 to set data using citas code
  //Debugger.log(['string that not works now is',this.selectedDate],false);
  //this.cita.setDate(this.selectedDate,true);
  //OLD CODE FROM IONIC DATEPICKER
  /*let now = new Date();
  Debugger.log([this.selectedDate]);
  let auxdate = new Date(this.selectedDate);
  Debugger.log([`times dif are now ${now.getTime()} vs sel ${auxdate.getTime()}`]);
  Debugger.log([`offset is`,new Date().getTimezoneOffset()]);
  let dateUT = auxdate.getTime();
  const offset = (new Date().getTimezoneOffset() * 60 * 1000 * 2); // offset is in minutes so 60 * 1000 to get  milliseconds
  dateUT = dateUT + offset;
  this.cita.setDateUT(dateUT);
  this.cita.data.field_datemsb['und'][0]['value'] = dateUT;
  Debugger.log([`saving ${dateUT} for ${new Date(dateUT)}`]);*/

  //CODE FOR CALENDAR PICKER
  /*let aux_date = new Date(this.dateobj.getTime());
  aux_date.setHours(0,0,0,0);
  aux_date = new Date(aux_date.getTime()+this.selectedHour);
  console.log('settingdateinput is',aux_date);
  let dateUT = aux_date.getTime();//this.aux_date.getTime();
  this.cita.setDateUT(dateUT);
  this.cita.data.field_datemsb['und'][0]['value'] = dateUT;*/

 
  
  //console.log('originaltime ', new Date().getTime() );
  //console.log('-----------------------------' );
  //console.log('obtained', aux_hour_date.getTime() );
  //console.log('offset',new Date().getTimezoneOffset() * 60 * 1000);
 
  //console.log('-offset',aux_hour_date.getTime()  - (new Date().getTimezoneOffset() * 60 * 1000));
  //let min = (aux_hour_date.getHours() * 60) + ( aux_hour_date.getMinutes() );
  //console.log('minutos obtenidos',min, min/60);
  
  //aux_date = new Date(aux_date.getTime()+this.selectedHour);
  /*console.log('selectedHourIso is',this.selectedHourISO);
  let auxdatehour = new Date(this.selectedHourISO);
  console.log('selecteddate is',auxdatehour);
  let hours = DateProvider.getDayHours(auxdatehour);
  console.log('setting date is', new Date(aux_date.getTime() + hours));
  console.log('hours pulled', hours);
  console.log('settingdateinput is',aux_date);
  const offset = (new Date().getTimezoneOffset() * 60 * 1000 * 2); // offset is in minutes so 60 * 1000 to get  milliseconds
  let dateUT = aux_date.getTime();
  dateUT = dateUT + offset + hours;
  console.log('dateUTset is',new Date(dateUT));
  this.cita.setDateUT(dateUT);
  this.cita.data.field_datemsb['und'][0]['value'] = dateUT;*/
  
   //CODE FOR CALENDAR AND HOUR PICKER
  //obtenemos la fecha sin horas.
  let aux_date = new Date(this.dateobj.getTime());
  aux_date.setHours(0,0,0,0);
  console.log('dia sin horas',aux_date);

  //obtenemos las horas em ms
  /*
  console.log('selectedisohour',this.selectedHourISO);
  let aux_hour_date = new Date(this.selectedHourISO);
  aux_hour_date = new Date(aux_hour_date.getTime()  + (new Date().getTimezoneOffset() * 60 * 1000 * 2));
  console.log(aux_hour_date);
  let ms =  (aux_hour_date.getHours()*60*60*1000)+(aux_hour_date.getMinutes()*60*1000);
  console.log('HOUR MS',ms,ms/(1000*60*60));*/
  //NO USAMOS ESTE CODIGO YA PORQUE YA NO QUIEREN EL IONIC HOUR INPUT HERMOSO QUE HICE. putos.

  console.log('hour string',this.horantr);
  let ms = Number(this.horantr.split(':')[0])*60*60*1000;
  ms += Number(this.horantr.split(':')[1])*60*1000;
  console.log('MSAdded',ms);
  
  let final_date_UT = aux_date.getTime() + ms;
  console.log('final date is', new Date(final_date_UT));
  this.cita.setDateUT(final_date_UT);
  this.cita.data.field_datemsb['und'][0]['value'] = final_date_UT;
}




calendarLoad(){
  this.date = new Date();
    this.monthNames = ["Enero","Febrero","Marzo","Abril","Mayi","Junio","Julio","Augosto","Septiembre","Octubre","Noviembre","Diciembre"];
    this.getDaysOfMonth();
    //this.loadEventThisMonth();
}


getDaysOfMonth() {
  this.daysInThisMonth = new Array();
  this.daysInLastMonth = new Array();
  this.daysInNextMonth = new Array();
  this.currentMonth = this.monthNames[this.date.getMonth()];
  this.currentMonthNum = this.date.getMonth();
  this.currentYear = this.date.getFullYear();
  if(this.date.getMonth() === this.dateobj.getMonth()) {
    this.currentDate = this.dateobj.getDate();
  } else {
    this.currentDate = 999;
  }

  var firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
  var prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
  for(var i = prevNumOfDays-(firstDayThisMonth-1); i <= prevNumOfDays; i++) {
    this.daysInLastMonth.push(i);
  }

  var thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
  for (var i = 0; i < thisNumOfDays; i++) {
    this.daysInThisMonth.push(i+1);
  }

  var lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDay();
  var nextNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0).getDate();
  for (var i = 0; i < (6-lastDayThisMonth); i++) {
    this.daysInNextMonth.push(i+1);
  }
  var totalDays = this.daysInLastMonth.length+this.daysInThisMonth.length+this.daysInNextMonth.length;
  if(totalDays<36) {
    for(var i = (7-lastDayThisMonth); i < ((7-lastDayThisMonth)+7); i++) {
      this.daysInNextMonth.push(i);
    }
  }
}

chosedayClick( day ){
  let datex = new Date();
  datex.setFullYear(this.currentYear,this.currentMonthNum,day);
  this.currentDate = datex.getDate();
  this.dateobj = datex;
  this.date = datex;
}

goToLastMonth() {
  this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
  this.getDaysOfMonth();
}

goToNextMonth() {
  this.date = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0);
  this.getDaysOfMonth();
}

async updateDoctores(){
  this.loader.presentLoader('Cargando Doctores...');
  await this.updater.updateSuscription();
  await this.updater.updateDocList();
  this.loader.dismissLoader();
  /*this.loader.presentLoader('Cargando Doctores...');
  var uid = this.userData.userData.uid;
  this.userData.loginSetData(uid);
  this.docData.cleanDoctor();
  await this.subscriptionManager.loadGroupSubuserSubs();
  //console.log("UNIDO Y DIFERENTE",JSON.stringify(this.docData.doctores));
  await this.docMan.loadGroupDoctors();
  //console.log("UNIDO Y DIFERENTE",JSON.stringify(this.docData.doctores));
  await this.docMan.initDoctoresUids();
  //console.log("UNIDO Y DIFERENTE",JSON.stringify(this.docData.doctores));
  await this.subscriptionManager.loadDoctorsSubscriptions();
  //console.log("UNIDO Y DIFERENTE",JSON.stringify(this.docData.doctores));
  this.docMan.filterActiveDoctors();
  this.loader.dismissLoader();*/
}











}

/**
 * Esto de aquí es para que el date me de el toisostring en la hora de aquí
 *  **/
/*
Date.prototype.toISOString = function() {
  var tzo = -this.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
          var norm = Math.floor(Math.abs(num));
          return (norm < 10 ? '0' : '') + norm;
      };
  return this.getFullYear() +
      '-' + pad(this.getMonth() + 1) +
      '-' + pad(this.getDate()) +
      'T' + pad(this.getHours()) +
      ':' + pad(this.getMinutes()) +
      ':' + pad(this.getSeconds()) +
      dif + pad(tzo / 60) +
      ':' + pad(tzo % 60);
}*/
