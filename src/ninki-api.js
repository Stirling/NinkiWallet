var jQuery = require('jquery-browserify');
var $ = require('jquery-browserify');
var sanitizer = require('sanitizer');
var common = require('./common');
var config = require('./config');

function API() {


}

//Implementing the GET and POST JQuery functions in a Node style.

var CSRF_HEADER = 'X-CSRF-Token';

var setCSRFToken = function (securityToken) {
    jQuery.ajaxPrefilter(function (options, _, xhr) {
        if (!xhr.crossDomain)
            xhr.setRequestHeader(CSRF_HEADER, securityToken);
    });
};

//setCSRFToken($('meta[name="token"]').attr('content'));

API.get = function (url, querydata, callback) {
    return this.get(url, querydata, callback);
}

function get(url, querydata, callback) {

    $.get(url, querydata, function (data) {
        return callback(null, data);

    }).fail(function (data, textStatus) {

        return callback(true, {
            textStatus: textStatus,
            data: data
        });
    });
}

API.post = function (url, postData, callback) {
    return lpost(url, postData, callback);
}

function lpost(url, postData, callback) {

    //https://ninkip2p.com

    var sessionToken = $('#API-Token').val();

    $.ajax({
        url: "https://localhost:1111" + url,
        type: "POST",
        data: JSON.stringify(postData),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: { 'api-token': sessionToken },
        success: function (data) {


            data = sanitizer.sanitize(data);


            var jdata = JSON.parse(data);



            if (jdata.error) {
                return callback(true, jdata.message);
            }
            if (!(typeof jdata.message === "undefined")) {
                return callback(false, jdata.message);
            }
            return callback(false, JSON.stringify(jdata));
        },
        fail: function (data, textStatus) {
            return callback(true, {
                textStatus: textStatus,
                data: data
            });
        },
        error: function (data) {

            console.log(data);
            if (data.status == 403) {
                //session has been lost

            }
            else if (data.status == 401) {

                //                if (!window.cordova) {
                //                    if (chrome) {
                //                        if (chrome.runtime) {
                //                            if (chrome.runtime.reload) {
                //                                chrome.runtime.reload()
                //                            } else {
                //                                location.reload();
                //                            }
                //                        } else {
                //                            location.reload();
                //                        }
                //                        //return callback(true, data.statusText);
                //                    } else {
                //                        location.reload();
                //                    }
                //                } else {
                //
                //                }


            } else {
                return callback(true, data.responseText);
            }


        }
    });
}


API.emailGUID = function (userName, callback) {

    API.post("/api/1/emailguid", {
        userName: userName
    }, function (err, response) {

        callback(err, response);

    });

}



//function getMasterPublicKeyFromUpstreamServer
//calls the server to generate the Ninki wallet keypair
//the user token and Ninki public key are returned
API.getMasterPublicKeyFromUpstreamServer = function (guid, callback) {


    var postData = { guid: guid };
    return lpost("/api/1/u/createaccount", postData, function (err, response) {

        if (err) {
            return callback(err, response);
        } else {

            var responseBody = JSON.parse(response);
            var userToken = responseBody.UserToken;
            var ninkiKey = responseBody.NinkiMasterPublicKey;
            var secret = responseBody.Secret;

            if (!responseBody.UserToken) {
                return callback(true, "ErrMasterKeyJSON");
            } else {
                return callback(null, ninkiKey, userToken, secret);
            }
        }
    });
}

//function doesUsernameExist
//verifies that the requested username does not already exist on our database
API.doesAccountExist = function (username, email, callback) {

    var postData = { username: username, email: email };

    lpost("/api/1/u/doesaccountexist", postData, function (err, response) {
        if (err) {
            return callback(err, response);
        } else {
            return callback(null, JSON.parse(response));
        }
    });
}


API.sendWelcomeDetails = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };

    lpost("/api/1/sendwelcomedetails", postData, function (err, response) {
        return callback(err, response);
    });
}


API.getEmailValidation = function (guid, sharedid, token, callback) {


    API.post("/api/1/getemailvalidation", {
        guid: guid,
        sharedid: sharedid,
        token: token
    }, function (err, response) {

        callback(err, response);

    });

}

API.getResetToken = function (guid, callback) {

    API.post("/api/1/u/getresettoken", {
        guid: guid
    }, function (err, response) {

        callback(err, response);
    });

}


API.validateSecret = function (guid, secret, callback) {

    var postData = { guid: guid, secret: secret };
    return lpost("/api/1/u/validatesecret", postData, function (err, dataStr) {

        if (err) {
            return callback(err, dataStr);
        } else {
            var data = JSON.parse(dataStr);
            return callback(err, data);
        }
    });
}

API.updateSecretPacket = function (guid, sharedid, vc, iv, callback) {

    var postData = { guid: guid, sharedid: sharedid, vc: vc, iv: iv };
    return lpost("/api/1/u/updatesecretpacket", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.unlockaccount = function (guid, token, callback) {

    var postData = { guid: guid, token: token };
    return lpost("/api/1/u/unlockaccount", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}


API.getWalletFromServer = function (guid, secret, twoFactorCode, rememberTwoFactor, callback) {

    var postData = { guid: guid, secret: secret, twoFactorCode: twoFactorCode, rememberTwoFactor: rememberTwoFactor };
    return lpost("/api/1/u/getaccountdetails", postData, function (err, dataStr) {

        if (err) {
            return callback(err, dataStr);
        } else {
            var data = JSON.parse(dataStr);
            var currentToken = $("#API-Token").val();

            //if (currentToken.length == 0) {
            if (data.SessionToken) {
                $("#API-Token").val(data.SessionToken);
            } else {
                $("#API-Token").val('');
            }
            //}

            return callback(err, data);
        }
    });
}


//function getBalance gets the summary balance for all the account's  outputs
API.getBalance = function (guid, sharedid, callback) {
    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getbalance", postData, function (err, dataStr) {
        if (err) {
            return callback(err, dataStr);
        } else {
            var data = JSON.parse(dataStr);
            return callback(err, data);
        }
    });
}


//function getBalance gets the summary balance for all the account's  outputs
API.getusernetworkcategory = function (callback) {

    var postData = {};
    return lpost("/api/1/getusernetworkcategory", postData, function (err, dataStr) {
        if (err) {
            return callback(err, dataStr);
        } else {
            var data = JSON.parse(dataStr);
            return callback(err, data);
        }
    });
}

API.updateusernetworkcategory = function (guid, sharedid, username, category, callback) {
    var postData = { guid: guid, sharedid: sharedid, username: username, category: category };
    return lpost("/api/1/updateusernetworkcategory", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}



//function getBalance gets the unconfirmed summary balance for all the account's  outputs
API.getUnconfirmedBalance = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getunconfirmedbalance", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}


//gets the username associated with the wallet
API.getNickname = function (guid, sharedid, callback) {
    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getnickname", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.getUserProfile = function (guid, sharedid, callback) {
    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getuserprofile", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.updateUserProfile = function (guid, sharedid, profileImage, status, tax, callback) {
    var postData = { guid: guid, sharedid: sharedid, profileImage: profileImage, status: status, tax: tax };
    return lpost("/api/1/u/updateuserprofile", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}


//function returns all outputs unspent by the wallet
API.getUnspentOutputs = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getunspentoutputs", postData, function (err, response) {
        var data1 = response;
        var data2 = JSON.parse(data1);
        return callback(err, data2.Message);
    });
}

//function returns all outputs unspent by the wallet
API.getCoinProfile = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getcoinprofile", postData, function (err, response) {
        var data = JSON.parse(response);
        return callback(err, data);
    });
}

API.getPrice = function (ccy, callback) {

    var postData = { ccy: ccy };
    return lpost("/api/1/u/getPrice", postData, function (err, response) {
        var data = JSON.parse(response);
        return callback(err, data);
    });
}

API.getPendingUserRequests = function (guid, sharedid, callback) {

    //these are requests made by me to other people
    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getpendinguserrequests", postData, function (err, data) {
        var friends = JSON.parse(data);

        return callback(err, friends);
    });
}

API.getFriendRequests = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getfriendrequests", postData, function (err, dataStr) {
        var jdata = JSON.parse(dataStr);
        return callback(err, jdata);
    });
}

API.getUserPacket = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getuserpacket", postData, function (err, dataStr) {

        var jdata = JSON.parse(dataStr);
        return callback(err, jdata);
    });
}

API.isNetworkExist = function (guid, sharedid, username, callback) {
    var postData = { guid: guid, sharedid: sharedid, username: username };
    lpost("/api/1/u/doesnetworkexist", postData, function (err, result) {
        var exists = JSON.parse(result);
        return callback(err, exists);

    });

}

API.rejectFriendRequest = function (guid, sharedid, username, callback) {
    var postData = { guid: guid, sharedid: sharedid, username: username };
    lpost("/api/1/u/rejectfriend", params, function (err, result) {
        return callback(err, result);
    });
}

API.getTransactionRecords = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };

    lpost("/api/1/u/gettransactionrecords", postData, function (err, transactions) {

        var jtran = JSON.parse(transactions);

        return callback(err, jtran);

    });

}

API.getInvoiceList = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };

    lpost("/api/1/u/getinvoicestopay", postData, function (err, invoices) {

        var jtran = JSON.parse(invoices);

        return callback(err, jtran);

    });

}

API.getInvoiceByUserList = function (guid, sharedid, callback) {

    var postData = { guid: guid, sharedid: sharedid };

    lpost("/api/1/u/getinvoicesbyuser", postData, function (err, invoices) {

        var jtran = JSON.parse(invoices);

        return callback(err, jtran);

    });

}



API.updateInvoice = function (guid, sharedid, username, invoiceId, transactionId, status, callback) {
    var postData = { guid: guid, sharedid: sharedid, userName: username, invoiceId: invoiceId, transactionId: transactionId, status: status };
    return lpost("/api/1/u/updateinvoice", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.getVersion = function (callback) {
    var postData = {};
    return lpost("/api/1/u/getversion", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.registerDevice = function (guid, deviceName, deviceId, deviceModel, devicePIN, regToken, secret, callback) {
    var postData = { guid: guid, deviceName: deviceName, deviceId: deviceId, deviceModel: deviceModel, devicePIN: devicePIN, regToken: regToken, secret: secret };
    return lpost("/api/1/u/registerdevice", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.getDeviceKey = function (guid, devicePIN, regToken, callback) {
    var postData = { guid: guid, devicePIN: devicePIN, regToken: regToken};
    return lpost("/api/1/u/getdevicekey", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.destroyDevice = function (guid, regToken, callback) {
    var postData = { guid: guid, regToken: regToken };
    return lpost("/api/1/u/destroydevice", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

API.destroyDevice2fa = function (guid, sharedid, deviceName, twoFactorCode, callback) {
    var postData = { guid: guid, sharedid: sharedid, deviceName: deviceName, twoFactorCode: twoFactorCode };
    return lpost("/api/1/u/destroydevice2fa", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}



API.createDevice = function (guid, sharedid, deviceName, callback) {
    var postData = { guid: guid, sharedid: sharedid, deviceName: deviceName };
    return lpost("/api/1/u/createdevice", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}


API.getDevices = function (guid, sharedid, callback) {
    var postData = { guid: guid, sharedid: sharedid };
    return lpost("/api/1/u/getdevices", postData, function (err, dataStr) {
        var jdevs = JSON.parse(dataStr);
        return callback(err, jdevs);
    });
}

API.getDeviceToken = function (guid, sharedid, deviceName, twoFactorCode, callback) {
    var postData = { guid: guid, sharedid: sharedid, deviceName: deviceName, twoFactorCode: twoFactorCode };
    return lpost("/api/1/u/getdevicetoken", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}



API.getRecoveryPacket = function (guid, callback) {
    var postData = { guid: guid };
    return lpost("/api/1/getrecoverypacket", postData, function (err, dataStr) {
        return callback(err, dataStr);
    });
}

module.exports = API;