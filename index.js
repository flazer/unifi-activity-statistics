const url = require('url');
const EventEmitter = require('eventemitter2').EventEmitter2;
const WebSocket = require('ws');
const rp = require('request-promise');

module.exports = class UnifiActivityStatistics extends EventEmitter {

    constructor(opts) {
        super({
            wildcard: true
        });

        this.opts = opts || {};
        this.opts.host              = this.opts.host || 'unifi';
        this.opts.port              = this.opts.port || 8443;
        this.opts.username          = this.opts.username || 'admin';
        this.opts.password          = this.opts.password || 'ubnt';
        this.opts.site              = this.opts.site || 'default';
        this.opts.unifios           = this.opts.unifios || false;
        this.opts.uplink_interface  = this.opts.uplink_interface ||'eth9';
        
        this.userAgent = 'node.js unifi-uplink-statistics UniFi Statistics';
        this.controller = url.parse('https://' + this.opts.host + ':' + this.opts.port);

        this.jar = rp.jar();

        this.rp = rp.defaults({
            rejectUnauthorized: !this.opts.insecure,
            jar: this.jar,
            headers: {
                'User-Agent':   this.userAgent,
                'Content-Type': 'application/json',
            },
            json: true
        });

        this.autoReconnectInterval = 5 * 1000;
        this.connect();
    }

    connect(reconnect) {
        this.isClosed = false;
        return this._login(reconnect)
            .then(() => {
                return this._listen();
            });
    }

    close() {
        this.isClosed = true;
        this.ws.close();
    }

    _login(reconnect) {
        let endpointUrl = `${this.controller.href}api/login`;
        if (this.opts.unifios) {
            // unifios using one authorisation endpoint for protect and network.
            endpointUrl = `${this.controller.href}api/auth/login`;
        }

        return this.rp.post(endpointUrl, {
            resolveWithFullResponse: true,
            body: {
                username: this.opts.username,
                password: this.opts.password,
                remember: true
            }
        }).catch((reason) => {
            if (!reconnect) {
                this._reconnect();
            }
        });
    }

    _listen() {
        const cookies = this.jar.getCookieString(this.controller.href);
        let eventsUrl = `wss://${this.controller.host}/wss/s/${this.opts.site}/events`;
        if (this.opts.unifios) {
            eventsUrl = `wss://${this.controller.host}/proxy/network/wss/s/${this.opts.site}/events`;
        }
        this.ws = new WebSocket(eventsUrl, {
            perMessageDeflate: false,
            rejectUnauthorized: !this.opts.insecure,
            headers: {
                'User-Agent': this.userAgent,
                Cookie: cookies
            }
        });

        const pingpong = setInterval(() => {
            this.ws.send('ping');
        }, 15000);

        this.ws.on('open', () => {
            this.isReconnecting = false;
            this.emit('ctrl.connect');
        });

        this.ws.on('message', data => {
            if (data === 'pong') {
                return;
            }
            try {
                const parsed = JSON.parse(data);
                if ('data' in parsed && Array.isArray(parsed.data)) {
                    parsed.data.forEach(entry => {
                        this._uplink(entry);
                    });
                }
            } catch (err) {
                this.emit('ctrl.error', err);
            }
        });

        this.ws.on('close', () => {
            this.emit('ctrl.close');
            clearInterval(pingpong);
            this._reconnect();
        });

        this.ws.on('error', err => {
            clearInterval(pingpong);
            this.emit('ctrl.error', err);
            this._reconnect();
        });
    }

    _reconnect() {
        if (!this.isReconnecting && !this.isClosed) {
            this.isReconnecting = true;
            setTimeout(() => {
                this.emit('ctrl.reconnect');
                this.isReconnecting = false;
                this.connect(true);
            }, this.autoReconnectInterval);
        }
    }

    _uplink(data) {
        if (data && data.port_table) {
            data.port_table.forEach(stats => {
               if (stats && stats.ifname && stats.ifname == 'eth9') {
                  if ('rx_bytes-r' in stats && 'tx_bytes-r' in stats) {
                      this.emit('uplink_activity', {'rx': stats['rx_bytes-r'], 'tx': stats['tx_bytes-r']});
                  }
               }
            });
        }
    }

    _ensureLoggedIn() {
        return this.rp.get(`${this.controller.href}api/${this.opts.unifios ? 'users/' : ''}self`)
            .catch(() => {
                return this._login();
            });
    }

    _url(path) {
        if (this.opts.unifios) {
            // unifios using an proxy, set extra path
            if (path.indexOf('/') === 0) {
                return `${this.controller.href}proxy/network/${path}`;
            }
            return `${this.controller.href}proxy/network/api/s/${this.opts.site}/${path}`;
        }
        else {
            if (path.indexOf('/') === 0) {
                return `${this.controller.href}${path}`;
            }
            return `${this.controller.href}api/s/${this.opts.site}/${path}`;
        }
    }

    get(path) {
        return this._ensureLoggedIn()
            .then(() => {
                return this.rp.get(this._url(path));
            });
    }

    del(path) {
        return this._ensureLoggedIn()
            .then(() => {
                return this.rp.del(this._url(path));
            });
    }

    post(path, body) {
        return this._ensureLoggedIn()
            .then(() => {
                return this.rp.post(this._url(path), {body});
            });
    }

    put(path, body) {
        return this._ensureLoggedIn()
            .then(() => {
                return this.rp.put(this._url(path), {body});
            });
    }
};
