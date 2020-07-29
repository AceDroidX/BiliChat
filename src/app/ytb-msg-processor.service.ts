import { Injectable } from '@angular/core';
import { IMessage, DanmakuMessage, GiftMessage } from './danmaku.def';
import { Observable, race, timer, fromEvent, Subscriber, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { YouTube } from './ytb-live-chat.service';
const request = require('request')
const { EventEmitter } = require('events')

export class YtbMsgService {

  private ws: WebSocket;

  private heartbeatHandler: any;

  public lastRenderInvoke: number;
  public lastRenderPush: number;

  private _ownerId: number;
  public get ownerId(): number {
    return this._ownerId;
  }
  public set ownerId(v: number) {
    this._ownerId = v;
  }

  constructor(private http: HttpClient,
    private proc: YtbMessageProcessorService) {
  }

  connect(roomid: string): Observable<IMessage> {
    const yt = new YouTube(roomid, environment.ytb_APIKEY);
    return new Observable(
      observer => {
        yt.on('ready', () => {
          observer.next(new DanmakuMessage(
            -1,
            'BILICHAT',
            'YouTube弹幕已连接',
            0,
            true,
            undefined,
            'assets/logo_icon.png'
          ));
          yt.listen(1000)
        })
        yt.on('message', data => {
          if (Date.now() - this.lastRenderInvoke > 1000) {
            console.log('Window Inactive');
            return;
          }
          this.proc.formMessage(data, observer)
        })
        yt.on('error', error => {
          observer.error(error);
        })
        yt.on('close', e => {
          observer.complete();
        })
      }
    );
  }
}


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
          data.authorDetails.displayName,
          data.snippet.textMessageDetails.messageText,
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
    request(jsondata.authorDetails.profileImageUrl, data => {
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
  request(url, callback) {
    request({
      url: url,
      method: 'GET',
      json: true,
    }, (error, response, data) => {
      if (error)
        this.emit('error', error)
      else if (response.statusCode !== 200)
        this.emit('error', data)
      else
        callback(data)
    })
  }
}


