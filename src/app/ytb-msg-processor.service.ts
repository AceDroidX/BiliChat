import { Injectable } from '@angular/core';
import { IMessage, DanmakuMessage, GiftMessage } from './danmaku.def';
import { Observable, race, timer, fromEvent, Subscriber, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
//import request from 'request'
import { EventEmitter } from 'events'
const axios = require('axios')

@Injectable({
  providedIn: 'root'
})
export class YtbMessageProcessorService extends EventEmitter {

  // showMember:boolean;
  // showModerator:boolean;
  loadAvatar = false;
  pure = true;
  ytbRoomId = null;

  constructor(private http: HttpClient,
    private translate: TranslateService) {
    super();
  }

  formMessage(data: any, observer: Subscriber<IMessage>) {
    if (!(data.authorDetails.isChatModerator || data.authorDetails.isChatOwner)) {
      return
    }
    this.avatarPreload(data).subscribe(
      avatarUrl => {
        const l = new DanmakuMessage(
          -1,//this.bili.ownerId  主播样式弹幕功能未做
          data.author.name,
          data.message,
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
    this.request(jsondata.authorDetails.profileImageUrl, data => {
      return data
    })
    // const obs = this.http.get(`${environment.ytb_api_server}/avturl/${jsondata.authorDetails.profileImageUrl}`)
    //   .pipe(
    //     // mapTo(x=>x.json()),
    //     mergeMap((data: any) => {
    //       if (data.face === 'http://static.hdslb.com/images/member/noface.gif') {
    //         return of(environment.default_avatar);
    //       }
    //       data.face = (<string>data.face).replace(/http:/g, 'https:');
    //       const img = new Image();
    //       img.referrerPolicy = 'no-referer';
    //       img.src = data.face;
    //       return race(
    //         fromEvent(img, 'load').pipe(
    //           map(x => data.face)
    //         ),
    //         fromEvent(img, 'error').pipe(
    //           map(x => environment.default_avatar)
    //         )
    //       );
    //     }),
    //     catchError(() => of(environment.default_avatar))
    //   );

    // return race(
    //   timer(1000).pipe(
    //     map(x => environment.default_avatar)
    //   ),
    //   obs
    // );
  }
  request(url, callback) {//https://yt3.ggpht.com/a-/AOh14Ghoj4Gh2t8XqyAR4MCtGe7_5tjigH6HuctULQ=s68-c-k-c0x00ffffff-no-rj-mo
    if (environment.ytb_proxy) {
      url = url.replace(environment.ytb_icon_prefix, environment.ytb_api_server+'/icon')
    }
    console.log(url)
    axios.get(url)
      .then(response => {
        if (response.status !== 200) {
          this.emit('error', response)
        } else {
          callback(response)
        }
      })
      .catch(error => { this.emit('error', error) })
      .then(function () {
        // always executed
      });
  }
}


