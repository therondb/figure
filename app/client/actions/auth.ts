import { routeActions } from 'redux-simple-router'
import { ThunkInterface } from 'redux-thunk';
import * as Firebase from 'firebase';

export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOGIN_SUCCEED = 'LOGIN_SUCCEED';
export const SET_AUTH_STATUS = 'SET_AUTH_STATUS';
export const USER_VALUE = 'USER_VALUE';

export function bindAuth(): ThunkInterface {
  return (dispatch: any, getState: any) => {
    const { firebase } = getState();

    firebase.onAuth((authData) => {
      if (authData) {
        dispatch(bindUser());
      } else {
        dispatch(unbindUser());
      }

      dispatch({ type: SET_AUTH_STATUS, authData });
    });
  };
}

let userValueCallback: Function = () => {};

function bindUser(): ThunkInterface {
  return (dispatch, getState) => {
    const { firebase } = getState();

    userValueCallback = firebase.child('users').child(firebase.getAuth().uid).on('value', (snapshot) => {
      dispatch({ type: USER_VALUE, snapshot: snapshot });
    });
  };
}

function unbindUser(): ThunkInterface {
  return (dispatch, getState) => {
    const { firebase, auth } = getState();

    let uid = auth.status.uid;

    if (uid) {
      firebase.child('users').child(uid).off('value', userValueCallback);
    }
  };
}

export function updateUser(data: { email: string }): ThunkInterface {
  return (dispatch, getState) => {
    const { firebase, auth } = getState();

    firebase.child('users').child(auth.status.uid).update(data);
  };
}

export function loginWithGithub() {
  return (dispatch: any, getState: any) => {
    const { firebase, routing } = getState();
    firebase.authWithOAuthPopup('github', (authError, authData) => {
      if (authError) {
        dispatch({ type: LOGIN_FAILED, authError });
      } else {
        dispatch({ type: LOGIN_SUCCEED, authData });
        dispatch(continueLogin({ uid: authData.uid, email: authData.github.email }));
      }
    });
  };
}

export function loginWithFacebook() {
  return (dispatch: any, getState: any) => {
    const { firebase, routing } = getState();

    firebase.authWithOAuthPopup('facebook', (authError, authData) => {
      if (authError) {
        dispatch({ type: LOGIN_FAILED, authError });
      } else {
        dispatch({ type: LOGIN_SUCCEED, authData });
        dispatch(continueLogin({ uid: authData.uid, email: authData.facebook.email }));
      }
    }, {
      scope: 'email'
    });
  };
}

export function logout() {
  return (dispatch: any, getState: any) => {
    const { firebase } = getState();

    firebase.unauth();
    dispatch(routeActions.push('/login'));
  }
}

const continueLogin = (userData: { uid: string, email: string }) => {
  return (dispatch: any, getState: any) => {
    const { firebase, routing } = getState();

    firebase.child('users').child(userData.uid).once('value', snapshot => {
      let currentUser = snapshot.val()

      if (!currentUser || !currentUser.email) {
        snapshot.ref().update({ email: userData.email });
      }
    });

    if (routing.location.state && routing.location.state.nextPathname) {
      dispatch(routeActions.push(routing.location.state.nextPathname));
    } else {
      dispatch(routeActions.push('/'));
    }
  }
}
