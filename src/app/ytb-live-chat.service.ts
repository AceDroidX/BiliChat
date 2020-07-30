// 由https://github.com/yuta0801/youtube-live-chat 修改而来
import { environment } from '../environments/environment';
//import request from 'request'
import { EventEmitter } from 'events'
const axios = require('axios')

/**
 * The main hub for acquire live chat with the YouTube Date API.
 * @extends {EventEmitter}
 */
export class YouTube extends EventEmitter {
    id = null
    key = null
    liveId = null
    chatId = null
    interval = null
    /**
     * @param {string} ChannelID ID of the channel to acquire with
     * @param {string} APIKey You'r API key
     */
    constructor(channelId, apiKey) {
        super()
        this.id = channelId
        this.key = apiKey
        this.getLive()
    }

    getLive() {
        const url = '/search' +
            '?eventType=live' +
            '&part=id' +
            `&channelId=${this.id}` +
            '&type=video' +
            `&key=${this.key}`
        this.request(url, data => {
            console.log("getLive:" + JSON.stringify(data))
            if (!data.items[0])
                this.emit('error', 'Can not find live.')
            else {
                this.liveId = data.items[0].id.videoId
                this.getChatId()
            }
        })
    }

    getUpcomingLive() {
        const url = '/search' +
            '?eventType=upcoming' +
            '&part=id' +
            `&channelId=${this.id}` +
            '&type=video' +
            `&key=${this.key}`
        this.request(url, data => {
            if (!data.items[0])
                this.emit('error', 'Can not find live.')
            else {
                this.liveId = data.items[0].id.videoId
                this.getChatId()
            }
        })
    }

    getChatId() {
        if (!this.liveId) return this.emit('error', 'Live id is invalid.')
        const url = '/videos' +
            '?part=liveStreamingDetails' +
            `&id=${this.liveId}` +
            `&key=${this.key}`
        this.request(url, data => {
            console.log('getChatId:' + JSON.stringify(data))
            if (!data.items.length)
                this.emit('error', 'Can not find chat.')
            else {
                this.chatId = data.items[0].liveStreamingDetails.activeLiveChatId
                this.emit('ready')
            }
        })
    }

    /**
     * Gets live chat messages.
     * See {@link https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list#response|docs}
     * @return {object}
     */
    getChat() {
        if (!this.chatId) return this.emit('error', 'Chat id is invalid.')
        const url = '/liveChat/messages' +
            `?liveChatId=${this.chatId}` +
            '&part=id,snippet,authorDetails' +
            '&maxResults=2000' +
            `&key=${this.key}`
        this.request(url, data => {
            console.log('getChat:' + JSON.stringify(data))
            this.emit('json', data)
        })
    }

    request(url, callback) {
        if (environment.ytb_proxy) {
            url = environment.ytb_api_prefix + url
        }else{
            url = environment.ytb_api_server + url
        }
        console.log(url)
        axios.get(url)
            .then(response => {
                console.log('axios.get.response:' + JSON.stringify(response))
                if (response.status !== 200) {
                    this.emit('error', response)
                } else {
                    callback(response)
                }
            })
            .catch(error => {
                console.log('axios.get.error:' + error)
                this.emit('error', error)
            })
            .then(function () {
                // always executed
            });
        // request(this.opt, (error, response, data) => {
        //     if (error)
        //         this.emit('error', error)
        //     else if (response.statusCode !== 200)
        //         this.emit('error', data)
        //     else
        //         callback(data)
        // })
    }

    /**
     * Gets live chat messages at regular intervals.
     * @param {number} delay Interval to get live chat messages
     * @fires YouTube#message
     */
    listen(delay) {
        let lastRead = 0, time = 0
        this.interval = setInterval(() => this.getChat(), delay)
        this.on('json', data => {
            for (const item of data.items) {
                time = new Date(item.snippet.publishedAt).getTime()
                if (lastRead < time) {
                    lastRead = time
                    /**
                    * Emitted whenever a new message is recepted.
                    * See {@link https://developers.google.com/youtube/v3/live/docs/liveChatMessages#resource|docs}
                    * @event YouTube#message
                    * @type {object}
                    */
                    this.emit('message', item)
                }
            }
        })
    }

    /**
     * Stops getting live chat messages at regular intervals.
     */
    stop() {
        clearInterval(this.interval)
        this.emit('close', null)
    }
}

//module.exports = YouTube