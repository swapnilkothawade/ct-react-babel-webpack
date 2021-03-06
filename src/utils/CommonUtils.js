import rp from 'request-promise';
import configData from '../config'
const API_BASE_URL = "https://api.commercetools.co/sampletest-8";

let serializeObject = function (obj) {
  var str = [];
  for (var key in obj) {
    if (obj[key] instanceof Array) {
      for (var idx in obj[key]) {
        var subObj = obj[key][idx];
        for (var subKey in subObj) {
          str.push(encodeURIComponent(key) + "[" + idx
            + "][" + encodeURIComponent(subKey)
            + "]="
            + encodeURIComponent(subObj[subKey]));
        }
      }
    } else {
      str.push(encodeURIComponent(key) + "="
        + encodeURIComponent(obj[key]));
    }
  }
  return str.join("&");
};

let getAuthToken = function () {
  return localStorage.getItem("currToken");
}

let setAuthToken = function (authToken) {
  localStorage.setItem("currToken", authToken);
}

let getCurrCartId = function () {
  return localStorage.getItem("currCartId");
}

let setCurrCartId = function (cartId) {
  localStorage.setItem("currCartId", cartId);
}

let removeCurrCartId = function () {
  localStorage.removeItem("currCartId");
}

let getCurrCartVersion = function () {
  return parseInt(localStorage.getItem("currCartVersion"));
}

let setCurrCartVersion = function (cartVersion) {
  localStorage.setItem("currCartVersion", cartVersion);
}

let removeCurrCartVersion = function () {
  localStorage.removeItem("currCartVersion");
}

let getCurrCustomerId = function () {
  return localStorage.getItem("currCustomerId");
}

let setCurrCustomerId = function (customerId) {
  localStorage.setItem("currCustomerId", customerId);
}

let getOrderNumber = function () {
  return localStorage.getItem("lastOrderNumber");
}

let setOrderNumber = function (orderId) {
  localStorage.setItem("lastOrderNumber", orderId);
}

let invokeAuthAPI = function () {
  let options = {
    method: "POST",
    url: "https://auth.commercetools.co/oauth/token",
    headers: {
      'Authorization': configData().ctAuthToken,
      'Content-type': 'application/x-www-form-urlencoded'
    },
    json: true,
    form: {
      'grant_type': 'client_credentials'
    }
  }
  rp(options)
    .then(function (body) {
      setAuthToken(body['access_token']);
    })
    .catch(function (err) {
      console.log("Auth Error Response", err);
    });
}

let signIn = function (credentials) {
  let currCartId = getCurrCartId();
  if (currCartId) {
    credentials.anonymousCartId = currCartId;
  }
  let options = {
    method: 'POST',
    url: `${API_BASE_URL}/login`,
    headers: {
      'Authorization': 'Bearer ' + getAuthToken(),
      'Content-type': 'application/json'
    },
    json: true,
    body: credentials
  }
  return rp(options)
    .then(function (body) {
      console.log("Login Success Response", body);
      setCurrCustomerId(body.customer.id);
      if (body.cart) {
        setCurrCartId(body.cart.id);
        setCurrCartVersion(body.cart.version);
      }
      return { body }
    })
    .catch(function (err) {
      console.log("Login Error Response", err);
      return { err }
    });
}

let fetchCustomer = function (customerId) {
  let options = {
    method: "GET",
    url: `${API_BASE_URL}/customers/${customerId}`,
    headers: {
      'Authorization': 'Bearer ' + getAuthToken(),
      'Content-type': 'application/json'
    },
    json: true
  }
  return rp(options)
    .then(function (body) {
      console.log("fetchCustomer Success Response", body);
      return { body };
    })
    .catch(function (err) {
      console.log("fetchCustomer Error Response", err);
      return { err }
    });
}

let fetchCustomerOrders = function (customerId, queryParams) {
  let customerParam = ["where", encodeURIComponent(`customerId="${customerId}"`)].join("=");
  let queryParam = "";
  if(queryParams){
    let limitParam = ["limit", queryParams.limit].join("=");
    let offsetParam = ["offset", queryParams.offset].join("=");
    let sortParam = ["sort", encodeURIComponent(queryParams.sort)].join("=");
    queryParam = [customerParam, limitParam, offsetParam, sortParam].join("&");
  } else{
    queryParam = customerParam
  }
  let apiUrl = `${API_BASE_URL}/orders?${queryParam}`;
  let options = {
    method: "GET",
    url: apiUrl,
    headers: {
      'Authorization': 'Bearer ' + getAuthToken(),
      'Content-type': 'application/json'
    },
    json: true
  }
  return rp(options)
    .then(function (body) {
      console.log("fetchCustomerOrders Success Response", body);
      return { body };
    })
    .catch(function (err) {
      console.log("fetchCustomerOrders Error Response", err);
      return { err }
    });
}

let fetchCustomerShoppingLists = function (customerId, queryParams) {
  let customerParam = ["where", encodeURIComponent(`customer(id="${customerId}")`)].join("=");
  let queryParam = "";
  if(queryParams){
    let limitParam = ["limit", queryParams.limit].join("=");
    let offsetParam = ["offset", queryParams.offset].join("=");
    let sortParam = ["sort", encodeURIComponent(queryParams.sort)].join("=");
    queryParam = [customerParam, limitParam, offsetParam, sortParam].join("&");
  } else{
    queryParam = customerParam
  }
  let apiUrl = `${API_BASE_URL}/shopping-lists?${queryParam}`;
  let options = {
    method: "GET",
    url: apiUrl,
    headers: {
      'Authorization': 'Bearer ' + getAuthToken(),
      'Content-type': 'application/json'
    },
    json: true
  }
  return rp(options)
    .then(function (body) {
      console.log("fetchCustomerShoppingLists Success Response", body);
      return { body };
    })
    .catch(function (err) {
      console.log("fetchCustomerShoppingLists Error Response", err);
      return { err }
    });
}

let fetchProducts = function () {
  let options = {
    method: "GET",
    url: `${API_BASE_URL}/products`,
    headers: {
      'Authorization': 'Bearer ' + getAuthToken(),
      'Content-type': 'application/json'
    },
    json: true
  }
  return rp(options)
    .then(function (body) {
      return { body }
    })
    .catch(function (err) {
      console.log("CartFetch Error Response", err);
      return { err }
    });
}

let fetchCart = function (cartId) {
  let options = {
    method: "GET",
    url: `${API_BASE_URL}/carts/${cartId}`,
    headers: {
      'Authorization': 'Bearer ' + getAuthToken(),
      'Content-type': 'application/json'
    },
    json: true
  }
  return rp(options)
    .then(function (body) {
      console.log("CartFetch Success Response", body);
      setCurrCartVersion(body.version);
      return { body };
    })
    .catch(function (err) {
      console.log("CartFetch Error Response", err);
      return { err }
    });
}

let createCart = function () {
  let currCustomerId = getCurrCustomerId();
  let createCartBody = {
    currency: "USD"
  }
  if (currCustomerId) {
    createCartBody.customerId = currCustomerId;
  }
  let options = {
    method: "POST",
    url: `${API_BASE_URL}/carts`,
    headers: {
      "Authorization": "Bearer " + getAuthToken(),
      "Content-Type": "application/json"
    },
    json: true,
    body: createCartBody
  }
  return rp(options)
    .then(function (body) {
      console.log("createCart Success Response", body);
      setCurrCartVersion(body.version);
      return { body };
    })
    .catch(function (err) {
      console.log("createCart Error Response", err);
      return { err };
    });
}

let addItemToCart = function (currSku) {
  let options = {
    method: "POST",
    url: `${API_BASE_URL}/carts/` + getCurrCartId(),
    headers: {
      "Authorization": "Bearer " + getAuthToken(),
      "Content-Type": "application/json"
    },
    json: true,
    body: {
      "version": getCurrCartVersion(),
      "actions": [{
        "action": "addLineItem",
        "sku": currSku.sku,
        "quantity": 1
      }]
    }
  }
  return rp(options)
    .then(function (body) {
      console.log("AddToCart Success Response", body);
      setCurrCartVersion(body.version);
      return { body };
    })
    .catch(function (err) {
      console.log("AddToCart Error Response", err);
      return { err };
    });
}

let addShippingToCart = function (shippingAddress) {
  let options = {
    method: "POST",
    url: `${API_BASE_URL}/carts/` + getCurrCartId(),
    headers: {
      "Authorization": "Bearer " + getAuthToken(),
      "Content-Type": "application/json"
    },
    json: true,
    body: {
      "version": getCurrCartVersion(),
      "actions": [{
        "action": "setShippingAddress",
        "address": shippingAddress
      }]
    }
  }
  return rp(options)
    .then(function (body) {
      console.log("addShippingToCart Success Response", body);
      setCurrCartVersion(body.version);
      return { body };
    })
    .catch(function (err) {
      console.log("addShippingToCart Error Response", err);
      return { err };
    });
}

let submitOrder = function () {
  let options = {
    method: "POST",
    url: `${API_BASE_URL}/orders/`,
    headers: {
      "Authorization": "Bearer " + getAuthToken(),
      "Content-Type": "application/json"
    },
    json: true,
    body: {
      "id": getCurrCartId(),
      "version": getCurrCartVersion()
    }
  }
  return rp(options)
    .then(function (body) {
      console.log("submitOrder Success Response", body);
      setOrderNumber(body.id);
      removeCurrCartId();
      removeCurrCartVersion();
      return { body };
    })
    .catch(function (err) {
      console.log("submitOrder Error Response", err);
      return { err };
    });
}

export {
  serializeObject,
  invokeAuthAPI,
  signIn,
  getAuthToken,
  fetchProducts,
  fetchCart,
  createCart,
  addItemToCart,
  addShippingToCart,
  getCurrCartId,
  fetchCustomer,
  getCurrCustomerId,
  setCurrCartId,
  setCurrCustomerId,
  getCurrCartVersion,
  setCurrCartVersion,
  submitOrder,
  getOrderNumber,
  setOrderNumber,
  removeCurrCartId,
  removeCurrCartVersion,
  fetchCustomerOrders,
  fetchCustomerShoppingLists
};
