// 0. Get clientKey
getClientKey().then((clientKey) => {
  getPaymentMethods().then(async (paymentMethodsResponse) => {

    
    
    const paypalConfiguration = {
      configuration: {
        merchantId: "2H3SV6643H24E",
        intent: "capture"
      },
    };

  
    //global config
    const configuration = {
      environment: "test",
      clientKey: clientKey, // Mandatory. clientKey from Customer Area
      paymentMethodsResponse,
      amount: '35123',

      paymentMethodsConfiguration: {
        paypal: paypalConfiguration,
      },
      

      onSubmit: (state, dropin) => {
        makePayment(state.data)
          .then((response) => {
            dropin.setStatus("loading");
            if (response.action) {
              //removed the handle action and adding dynamic timestamp?
              class TimeComponent extends HTMLElement {
                connectedCallback() {
                    const date = new Date();
                    this.innerHTML = `<h3>Timestamp: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}</h3>`
                }
            }           
            customElements.define('current-time', TimeComponent);
            // all removed stuff 

            } else if (response.resultCode === "Authorised") {
              dropin.setStatus("success", { message: "Payment successful!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            } else if (response.resultCode !== "Authorised") {
              dropin.setStatus("error", { message: "Oops, try again please!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            }
          })
          .catch((error) => {
            throw Error(error);
          });
      },

     onError: (e) => {
      console.log(e);
      },

      onAdditionalDetails: (state, dropin) => {
        submitDetails(state.data)
          .then((response) => {
            if (response.action) {
              dropin.handleAction(response.action);
            } else if (response.resultCode === "Authorised") {
              dropin.setStatus("success", { message: "Payment successful!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            } else if (response.resultCode !== "Authorised") {
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            }
          })
          .catch((error) => {
            throw Error(error);
          });
      },
    };

    // 1. Create an instance of AdyenCheckout
    const checkout = await AdyenCheckout(configuration);

    // 2. Create and mount the Component
    const dropin = checkout
      .create("dropin", {
        
      })
      .mount("#dropin-container");
  });
});

// Redirect handling code starts here till the end

async function handleRedirectResult(redirectResult) {
  const checkout = await AdyenCheckout({
    environment: "test",
    clientKey: "test_M35ZRWIW6JHMPOLIAJELF2OYEYIKZQEP",
    locale: "en-GB",
  });
  const dropin = checkout
    .create("dropin", {
      setStatusAutomatically: false,
    })
    .mount("#dropin-container");

  submitDetails({ details: { redirectResult } }).then((response) => {

    if (response.resultCode === "Authorised") {
      document.getElementById("result-container").innerHTML =
        '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
    } else if (response.resultCode !== "Authorised") {
      document.getElementById("result-container").innerHTML =
        '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
    }
  });
}

const getSearchParameters = (search = window.location.search) =>
  search
    .replace(/\?/g, "")
    .split("&")
    .reduce((acc, cur) => {
      const [key, prop = ""] = cur.split("=");
      acc[key] = decodeURIComponent(prop);
      return acc;
    }, {});

const { redirectResult } = getSearchParameters(window.location.search);

if (redirectResult) {
  handleRedirectResult(redirectResult);
}
