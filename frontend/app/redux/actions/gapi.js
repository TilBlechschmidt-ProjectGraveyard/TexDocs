import { Map } from 'immutable';

import {API_LOADED, AUTH_INITIALIZED, AUTHORIZED, TOKEN_REFRESH, TOKEN_REFRESHER_REGISTERED} from "../reducers/gapi";
import {CLIENT_ID, SCOPES, TOKEN_REFRESH_INT} from "../../const";

export function loadGAPI() {
    return new Promise(resolve => {
        window.gapi.load('auth2,auth:client,drive-realtime,drive-share,picker', () => {
            window.gapi.client.load('drive', 'v3', () => {
                resolve({
                    type: API_LOADED
                });
            });
        });
    });
}

export function initGAPI(auth2) {
    const gAuth = auth2.init({
        client_id: CLIENT_ID,
        scope: 'profile email openid ' + SCOPES.join(' ')
    });
    return new Promise(resolve => {
        gAuth.then(() => {
            resolve({
                type: AUTH_INITIALIZED,
                gAuth: gAuth
            });
        })
    });
}

export function authorized(gAuth) {
    const profile = gAuth.currentUser.get().getBasicProfile();
    return {
        type: AUTHORIZED,
        user: Map({
            id: profile.getId(),
            name: profile.getName(),
            image: profile.getImageUrl(),
            email: profile.getEmail()
        })
    };
}

export function authorize(gAuth) {
    return new Promise((resolve, reject) => {
        gAuth.signIn().then(() => {
            alert("Authorization succeeded");
            resolve(authorized(gAuth));
        }, (err) => {
            alert(`Authorization failed (${err.error})!`);
            reject(err);
            throw JSON.stringify(err);
        });
    });
}

export function refreshToken(auth) {
    return new Promise(resolve => {
        auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            immediate: true
        }, (res) => {
            resolve({
                type: TOKEN_REFRESH,
                token: res.access_token
            });
        });
    });
}

export function registerTokenRefresher(auth, dispatch) {
    dispatch(refreshToken(auth));
    return {
        type: TOKEN_REFRESHER_REGISTERED,
        intervalID: setInterval(() => {
            dispatch(refreshToken(auth));
        }, TOKEN_REFRESH_INT)
    }
}
