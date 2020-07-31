import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { YtbMessageProcessorService } from './ytb-msg-processor.service';
import { IMessage, DanmakuMessage } from './danmaku.def';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class YtbwsService {

    private ws: WebSocket;

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
        this.ws = new WebSocket(environment.ytb_chat_server);
        return new Observable(
            observer => {
                this.ws.onopen = (e) => {
                    this.ws.send(roomid)
                    observer.next(new DanmakuMessage(
                        -1,
                        'BILICHAT',
                        'YouTube弹幕已连接',
                        0,
                        true,
                        undefined,
                        'assets/logo_icon.png'
                    ));
                };
                this.ws.onmessage = (e) => {
                    if (Date.now() - this.lastRenderInvoke > 1000) {
                        console.log('Window Inactive');
                        return;
                    }
                    this.proc.formMessage(e, observer)
                };
                this.ws.onerror = (e) => {
                    observer.error(e);
                };
                this.ws.onclose = (e) => {
                    observer.complete();
                };
            }
        );
    }
}