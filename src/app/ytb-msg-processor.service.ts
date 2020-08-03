import { Injectable } from '@angular/core';
import { IMessage, DanmakuMessage, GiftMessage } from './danmaku.def';
import { Observable, race, timer, fromEvent, Subscriber, of, throwError } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class YtbMessageProcessorService {

  // showMember:boolean;
  // showModerator:boolean;
  loadAvatar = true;
  pure = false;
  ytbRoomId = null;
  ytbShowTime = null;

  constructor(private http: HttpClient,
    private translate: TranslateService) {
  }

  formMessage(data: any, biliOwnerId: number, observer: Subscriber<IMessage>) {
    console.log('biliOwnerId:' + biliOwnerId.toString())
    this.avatarPreload(data).subscribe(
      avatarUrl => {
        var message = data.message
        if (this.ytbShowTime) {
          var date = new Date(data.timestamp)
          message = message + date.toString().split(" ")[4]
        }
        const l = new DanmakuMessage(
          biliOwnerId,//this.bili.ownerId  主播样式弹幕功能未做
          data.author.name,
          message,
          0,
          true,
          undefined,
          avatarUrl
        );
        observer.next(l);
      }
    );
  }

  avatarPreload(jsondata: any): Observable<string> {
    if (!this.loadAvatar) {
      return of(environment.default_avatar);
    }
    if (this.pure) {
      return of(environment.default_avatar);
    }
    var url = jsondata.author.imageUrl
    console.log('jsondata.author.imageUrl:' + url)
    if (environment.ytb_proxy) {
      url = url.replace(environment.ytb_icon_prefix, environment.ytb_api_server + '/icon')
    }
    console.log(url)
    return of(url)
  }
}


